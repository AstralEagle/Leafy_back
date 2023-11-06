import {
  addDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  where,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../utils/database";
import { Router } from "express";
import { auth } from "../middlewares/auth";

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

app.get("/", auth, async (req: any, res) => {
  try {
    const invoicesRef = collection(db, "invoices");

    const userId = req.auth.userId;

    const q = query(invoicesRef, where("userId", "==", userId));
    const invoices = (await getDocs(q)).docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));

    res.status(200).json({ invoices });
  } catch (error: any) {
    return res.status(error.statusCode).json({ error });
  }
});

app.post("/", auth, async (req: any, res) => {
  try {
    const { city, zip, country, address } = req.body;

    const addr = {
      city,
      zip,
      country,
      address,
    };

    const userId = req.auth.userId;
    await addInvoice({ address: addr, userId });

    const docRef: any = doc(db, "utilisateurs", req.auth.userId);
    const user: any = (await getDoc(docRef)).data();

    const dataEdited: any = {
      storage: { used: user.storage.used, max: user.storage.max + 21474836480 },
    };
    await updateDoc(docRef, dataEdited);

    res.status(201).json("Successfully payed");
  } catch (error: any) {
    return res.status(error.statusCode).json({ error });
  }
});

export default app;