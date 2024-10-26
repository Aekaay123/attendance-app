"use server";
import {app} from '../app/firebase/config'
import { addDoc, collection, getFirestore } from "firebase/firestore";
export async function addemployee({data}) {
  try {
    const db=getFirestore(app);
    const collectionref = collection(db, "employees");
    const success =await addDoc(collectionref, {
      name:data.name,
      email:data.email,
      phonenumber:data.phonenumber,
    });
    if (success) {
       return {
        message:"Successfully added"
       } 
    } else {
       return{
        error:"Failed to add"
       }
    }  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return{
      message:"something went wrong"
    }
  }
}
