import {
  addDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../utils/database";
import { Router } from "express";
const app = Router();

interface AddressType {
  zip: string;
  city: string;
  country: string;
  address: string;
}

interface InvoiceType {
  address: AddressType;
  userId: string;
}

export const addInvoice = async ({ address, userId }: InvoiceType) => {
  const invoicesCollection = collection(db, "invoices");
  await addDoc(invoicesCollection, {
    date: serverTimestamp(),
    TVA: 20, // %
    taxes: (19.1 * 20) / 100 + 0.9, // €
    quantity: 20, // GO
    stripe: 0.9, // € taxes
    amount: 15.28, // HT €
    totalAmount: 15.28 + 0.9 + (19.1 * 20) / 100, // € TTC
    userId,
    address,
  });
};

app.get("/", async (req, res) => {
  try {
    const invoicesRef = collection(db, "invoices");
    const userId = req.query.userId;

    const q = query(invoicesRef, where("userId", "==", userId));
    const invoices = (await getDocs(q)).docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ invoices });
  } catch (error: any) {
    return res.status(error.statusCode).json({ error });
  }
});

export default app;
