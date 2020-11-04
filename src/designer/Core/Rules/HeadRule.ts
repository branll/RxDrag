import { Rule } from "./Rule";
import { INode } from "../Node/INode";
import { IMeta } from "../Node/IMeta";
import { IField } from "./IRule";
import TextInput from "designer/Attrebutebox/Inputs/TextInput";

export class HeadRule extends Rule{
  editPaddingY = '';
  editPaddingX = '';

  match(meta:IMeta){
    let tagName = meta.name.toLowerCase();
    return tagName === 'h1' || 
      tagName === 'h2' || 
      tagName === 'h3' || 
      tagName === 'h4' ||
      tagName === 'h5' ||
      tagName === 'h6';
  }
  
  accept(child:INode){
    return false;
  }

  resolveLabel(meta:IMeta):string|undefined{
    return meta.name
  }

  getFields(): Array<IField>{
    return [
       {
        name:'rxText',
        label:'text',
        input:TextInput,
      },
    ]
  }

}