// @ts-nocheck
import Card from "~~/components/Card";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

 export default function Explore({ params }:any) {
    
    
    return <div>
         <div className="card-list">
      {cards.map(card => (
        <Card 
          key={id} 
          title={card.title} 
          description={card.description} 
          
        />
      ))}
    </div>


        </div>;
}