//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useContractRead, useContractWrite } from "wagmi";
import { CONTRACT_ABI } from "~~/app/lib/abi";

//@ts-nocheck

//@ts-nocheck

const contractAddress = "0xfE8fE7B3BcE21A8980C6f50F11574f6fC1172217";

export default function CampaignPage(query: { params: { id: string } }) {
  const [petition, setPetition] = useState({
    title: "",
    description: "",
    signatures: 0,
    goal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const petitionIdNumber = Number(query.params.id);

  const { data: title, error: titleError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionTitle",
    args: [petitionIdNumber],
  });

  const { data: description, error: descriptionError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionDescription",
    args: [petitionIdNumber],
  });

  const { data: signatures, error: signaturesError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionSignatures",
    args: [petitionIdNumber],
  });

  const { data: goal, error: goalError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionGoalSignatures",
    args: [petitionIdNumber],
  });

  useEffect(() => {
    console.log(titleError);
    console.log(descriptionError);

    if (titleError || descriptionError || signaturesError || goalError) {
      setError("Errore nel recupero dati della petizione.");
    }
  }, [titleError, descriptionError, signaturesError, goalError]);

  console.log(title, description, signatures, goal);

  useEffect(() => {
    if (title && description && signatures !== undefined && goal) {
      setPetition({
        title: title as string,
        description: description as string,
        signatures: signatures.toString(),
        goal: goal.toString(),
      });
    }
  }, [title, description, signatures, goal]);

  const { write: signPetition, isLoading: isSigning } = useContractWrite({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "signPetition",
    args: [petitionIdNumber],
    onError(error) {
      setError("Errore durante la firma della petizione.");
      console.error(error);
    },
    onSuccess() {
      setPetition(prev => ({
        ...prev,
        signatures: prev.signatures + 1,
      }));
    },
  });

  async function handleSign() {
    setLoading(true);
    try {
      await signPetition();
    } catch (error) {
      console.error("Error during sign petition:", error);
    }
    setLoading(false);
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
          className="max-w-sm rounded-lg shadow-2xl"
          alt="Petition"
        />
        <div>
          <h1 className="text-5xl font-bold">{petition.title}</h1>
          <p className="py-6">{petition.description}</p>
          <p className="mt-2">
            Signatures: {petition.signatures} / {petition.goal}
          </p>
          {error && <p className="text-red-500">{error}</p>}
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={handleSign}
            disabled={isSigning || petition.signatures >= petition.goal}
          >
            {isSigning ? "Signing..." : "Sign Petition"}
          </button>
        </div>
      </div>
    </div>
  );
}
