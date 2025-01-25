// @ts-nocheck
"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";


export default function Card({title, description, id}) {

    const router = useRouter();

  return (
    <div className="flex justify-around pt-10  " >
<div className="card bg-primary text-primary-content w-96">
  <div className="card-body">
    <h2 className="card-title">{title}</h2>
    <p>{description}</p>
    <div className="card-actions justify-end">
      <button className="btn" onClick={()=>{
          router.push(`/campaign/${id}`)}} >Expand</button>
    </div>
  </div>
</div>
    </div>
  );
}
