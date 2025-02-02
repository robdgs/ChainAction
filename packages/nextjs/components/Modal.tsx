import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AbiCoder, BrowserProvider, Contract, ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { useWriteContract } from "wagmi";
import { CONTRACT_ABI } from "~~/app/lib/abi";

const contractAddress = "0xfE8fE7B3BcE21A8980C6f50F11574f6fC1172217";

export default function MyModal() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [goalSignatures, setGoalSignatures] = useState("");
  const [petitionId, setPetitionId] = useState<number>(0);
  const router = useRouter();

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    const initContract = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        console.log("Contract ABI:", CONTRACT_ABI);
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new BrowserProvider(window.ethereum);
        //const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const signer = await provider.getSigner();
        const contractInstance = new Contract(contractAddress, CONTRACT_ABI, signer);
        setContract(contractInstance);
      } else {
        console.error("Metamask non trovato!");
      }
    };

    initContract();
  }, []);

  const createPetition = async () => {
    if (!contract) {
      alert("Contratto non inizializzato!");
      return;
    }

    try {
      const goal = parseInt(goalSignatures, 10);
      if (isNaN(goal) || goal <= 0) {
        alert("Goal deve essere un numero positivo!");
        return;
      }
      console.log({
        contract,
      });
      // const publicClient = createPublicClient({
      //   chain: arbitrumSepolia,
      //   transport: http(),
      // });
      // const txHash = await writeContractAsync({
      //   address: contractAddress,
      //   abi: CONTRACT_ABI,
      //   functionName: "createPetition",
      //   args: [title, description, BigInt(goal)],
      // });

      const tx = await contract.createPetition(title, description, BigInt(goal));
      const receipt = await tx.wait();
      const abiCoder = new AbiCoder();

      const newPetitionId = receipt.logs[0].args[0].toString();
      console.log({
        newPetitionId,
      });
      setPetitionId(newPetitionId);
      setAuthor(contractAddress);
      alert("Petizione creata con successo!");
      router.push(`/campaign/${newPetitionId}`);
    } catch (error) {
      console.error("Errore nella creazione della petizione:", error);
    }
  };

  return (
    <div>
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
          <h3 className="font-bold text-lg">Crea una nuova petizione</h3>
          <form className="w-full">
            <label className="input input-bordered flex items-center gap-2">
              <input type="text" className="grow" placeholder="Titolo" onChange={e => setTitle(e.target.value)} />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Descrizione"
                onChange={e => setDescription(e.target.value)}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="number"
                className="grow"
                placeholder="Goal Firme"
                onChange={e => setGoalSignatures(e.target.value)}
              />
            </label>
            <button className="btn" type="button" onClick={createPetition}>
              Create
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
