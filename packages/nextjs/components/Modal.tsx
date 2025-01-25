// @ts-nocheck
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";


export default function MyModal() {

  const [inputValue, setInputValue] = useState<string>("");
  const router = useRouter();
  const id = 11;

  const { data: storedData, refetch } = useScaffoldReadContract({
    contractName: "SimpleStorage",
    functionName: "getStoredData",
  });


  const { writeAsync, isLoading } = useScaffoldWriteContract({
    contractName: "SimpleStorage",
    functionName: "setStoredData",
    args: [inputValue],
    onBlockConfirmation: () => {
      refetch(); 
      setInputValue(""); 
    },
  });

  return (
    <>
    <button
  className="btn"
  onClick={() => {
    const modal = document?.getElementById("my_modal_2") as HTMLDialogElement;
    modal?.showModal();
  }}
>
  Create
</button>
<dialog id="my_modal_2" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <form     onSubmit={(e) => {
          e.preventDefault();
          if (inputValue.trim()) writeAsync;
        }}
        className="w-full">
    <label className="input input-bordered flex items-center gap-2">

<input type="text" className="grow" placeholder="Author"  onChange={(e) => setInputValue(e.target.value)}/>
</label>
    <label className="input input-bordered flex items-center gap-2">
  <input type="text" className="grow" placeholder="Goal" />
</label>

{/*<label className="input input-bordered flex items-center gap-2">

  <input type="text" className="grow" placeholder="Category" />
</label>*/}
<label className="input input-bordered flex items-center gap-2">
<input type="text" className="grow" placeholder="Title" />
</label>
<label className="input input-bordered flex items-center gap-2">

  <input type="text" className="grow" placeholder="Description" />
</label>
        <button className="btn" type="submit" disabled={isLoading || !inputValue.trim()} onClick={()=>{
          router.push(`/campaign/${id}`)}
            }
        >
          {isLoading ? "Inviando..." : "Salva"}</button>
    </form>
  </div>
</dialog>
    </>
  );
}
