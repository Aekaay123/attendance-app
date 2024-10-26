"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getFirestore,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { app } from "../../app/firebase/config";
import { columns } from "./table/Column";
import { DataTable } from "./table/DataTable";
import toast from "react-hot-toast";

const DisplayEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDeleteEmployee = async (id) => {
    try {
      const db = getFirestore(app);
      const docRef = doc(db, "employees", id);
      await deleteDoc(docRef);
      toast.success("Deleted employee successfully!");
    } catch (error) {
      toast.error("Error deleting employee: " + error.message);
    }
  };

  useEffect(() => {
    setLoading(true);

    const db = getFirestore(app);
    const collectionRef = collection(db, "employees");

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const fetchedManagers = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));

      setEmployees(fetchedManagers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={employees}
        setEmployees={setEmployees}
        handleDeleteEmployee={handleDeleteEmployee}
        isLoading={loading}
      />
    </div>
  );
};

export default DisplayEmployees;
