import {Link} from "react-router-dom";

export default function(){

    return(
<>
<section>

<main className="m-2 flex flex-row ">

<div className="flex flex-col shrink-[2] w-60 h-screen border-r border-gray-400 overflow-hidden">
<div className="mt-10 text-[25px] font-serif h-[2.5rem] flex items-center pl-8">
          ShareXP
        </div>
        <div className="mt-[1.25rem] text-[20px] font-serif h-[2.5rem] flex items-center pl-8">
        Recent Search
      </div>
      </div>
<div className=" pl-2 flex flex-col flex-1 ">
    
    <input 
    type="text"
    placeholder="Search"
    className="w-full p-2 mt-[6rem] border rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
    >
    
    </input>
</div>

</main>

</section>



</>

    );

}