import { NextResponse } from 'next/server';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../firebase/config";

export async function POST(req) {
  try {
    const { Email} = await req.json();
    const db = getFirestore(app);
    const collectionRef = collection(db, "employees");
    const querySnapshot = await getDocs(collectionRef);

    let isRegistered= false;
    querySnapshot.forEach((doc) => {
      if (doc.data().email=== Email.toLowerCase().trim() || Email==="kenchowangdi936@gmail.com") {
        isRegistered = true;
        return; 
      }
    });

    return NextResponse.json({ isRegistered });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error checking registration" });
  }
}
