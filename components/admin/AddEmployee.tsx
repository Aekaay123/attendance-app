"use client";
import { useState } from "react";
import { addemployee } from "@/actions/addemployee";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { useSelector } from "react-redux";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().trim().email(),
  phonenumber: z
    .string()
    .min(8, { message: "Phone number should be at least 8 digits long" }),
});

const AddEmployee = () => {
  const [isopen, setisopen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTheme=useSelector((state:any)=>state.theme.mode);

  const handlesubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phonenumber: formData.get("phonenumber"), 
    };

    const result = formSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      toast.error(errorMessages);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await addemployee({ data });
      if (response?.message) {
        toast.success(response.message);
        setisopen(false);
      }
    } catch (error) {
      toast.error("An error occurred while adding the manager");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
     <div className="">
     <Dialog open={isopen} onOpenChange={setisopen}>
        <DialogTrigger
          onClick={() => setisopen(true)}
          className="p-2 border outline-none flex items-center gap-x-2 text-black drop-shadow-sm"
        >
          <UserPlus className={`h-4 w-4 ${selectedTheme === "dark" ? "text-white" : "text-black"}`}/>  <span className={`${selectedTheme === "dark" ? "text-white" : "text-black" }`}>Add employees </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-center text-white text-lg }`}>
              Add new employee
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlesubmit} className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="p-3 outline-none text-black rounded-xl border"
                placeholder="Name"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="p-3 text-black outline-none rounded-xl border"
                placeholder="Email address"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phonenumber">Phone Number:</label>
              <input
                id="phonenumber"
                type="tel"
                name="phonenumber"
                className="p-3 text-black outline-none rounded-xl border"
                placeholder="Phone number"
              />
            </div>
            <div className="flex w-full text-center justify-between mt-16">
              <button
                type="submit"
                className={`bg-black hover:bg-orange-500 text-white w-full px-4 p-3 rounded-xl${selectedTheme === "dark" ? "bg-white border border-white text-black" : "bg-black text-white" }  px-4 py-2 rounded-xl`}
              >
                {loading ? "ADDING..." : "ADD"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
     </div>
    </>
  );
};

export default AddEmployee;
