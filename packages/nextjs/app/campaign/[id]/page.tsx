// @ts-nocheck
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

function CampaignPage({ params }:any) {

    
    return <div>
        
        Campagna con ID: {params.id}
        <div className="hero bg-base-200 min-h-screen">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <img
      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
      className="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 className="text-5xl font-bold">{params.title}</h1>
      <p className="py-6">
     {params.description}
      </p>
      <button className="btn btn-primary">Sign</button>
      <button className="btn btn-primary">Donate 0.001 ETH</button>
    </div>
  </div>
</div>

        </div>;
}




export default CampaignPage;