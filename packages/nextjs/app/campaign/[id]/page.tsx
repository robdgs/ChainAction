//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AbiCoder, BrowserProvider, Contract, ethers } from "ethers";
import { useContractRead, useContractWrite, useWriteContract } from "wagmi";
import { CONTRACT_ABI } from "~~/app/lib/abi";

const contractAddress = "0xfE8fE7B3BcE21A8980C6f50F11574f6fC1172217";

export default function CampaignPage(query: { params: { id: string } }) {
  const [petition, setPetition] = useState({
    title: "",
    description: "",
    signatures: 0,
    goal: 0,
  });
  //const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const petitionIdNumber = Number(query.params.id);

  const { data: title, error: titleError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionTitle",
    args: [BigInt(petitionIdNumber)],
  });

  const { data: description, error: descriptionError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionDescription",
    args: [BigInt(petitionIdNumber)],
  });

  const { data: signatures, error: signaturesError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionSignatures",
    args: [BigInt(petitionIdNumber)],
  });

  const { data: goal, error: goalError } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getPetitionGoalSignatures",
    args: [BigInt(petitionIdNumber)],
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
        signatures: Number(signatures),
        goal: Number(goal),
      });
    }
  }, [title, description, signatures, goal]);

  // const { write: signPetition, isLoading: isSigning, error: signPetitionError } = useWriteContract({
  //   address: contractAddress,
  //   abi: CONTRACT_ABI,
  //   functionName: "signPetition",
  //   args: [petitionIdNumber],
  //   onError(error) {
  //     setError("Errore durante la firma della petizione.");
  //     console.error("Error during sign petition:", error);
  //   },
  //   onSuccess() {
  //     setPetition((prev) => ({
  //       ...prev,
  //       signatures: prev.signatures + 1,
  //     }));
  //   },
  // });



  // Inizializza il provider, signer e il contratto
  const provider = new BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new Contract(contractAddress, CONTRACT_ABI,signer);
  
  // Funzione per firmare la petizione
  const signPetition = async (petitionIdNumber:any) => {
    try {
      // Chiamata alla funzione del contratto
      const tx = await contract.signPetition(petitionIdNumber);
      
      // Attendi che la transazione venga confermata
      await tx.wait();
      
      // Aggiorna lo stato della petizione
      setPetition((prev) => ({
        ...prev,
        signatures: prev.signatures + 1,
      }));
    } catch (error) {
      // Gestisci l'errore
      setError("Errore durante la firma della petizione.");
      console.error("Error during sign petition:", error);
    }
  };
  

  async function handleSign() {
    alert("Petition signed!");
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
            Signatures: {petition.signatures ++} / {petition.goal}
          </p>
          {error && <p className="text-red-500">{error}</p>}
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={handleSign}
          >
        Sign
          </button>
        </div>
      </div>
    </div>
  );
}
