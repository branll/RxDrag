import { after, before, first, insertAfter, insertBefore, last, remove } from "ArrayHelper";
import { IRect } from "base/Model/IRect";
import { cloneObject } from "utils/cloneObject";

export class RXNode<T>{
  static idSeed:number = 1;
  id: number = 0;  
  meta!: T;
  children: Array<RXNode<T>>;
  parent?:RXNode<T>;
  dom?:HTMLElement;

  static make<T>(meta:T){
    let node = new RXNode<T>();
    node.seedId();      
    node.meta = meta;
    let metaAny = meta as any    
    const meteChildren = metaAny.children as Array<T>|undefined;
    node.children = [];
    meteChildren?.forEach(child=>{
      let childNode = RXNode.make<T>(child);
      childNode.parent = node;
      node.children.push(childNode);
    })

    //去掉Meta的Children，避免后期数据污染
    metaAny.children = undefined;

    return node;
  }

  constructor(){
    this.children = [];
  }

  seedId(){
    this.id = RXNode.idSeed
    RXNode.idSeed ++
  }

  get rect():IRect|undefined{
    return this.dom?.getBoundingClientRect();
  }

  //完全复制包括ID的复制
  copy(){
    let copy = new RXNode<T>();
    copy.meta = cloneObject(this.meta);
    copy.id = this.id;
    copy.children = [];
    this.children.forEach(child=>{
      let childCopy = child.copy();
      childCopy.parent = copy;
      copy.children.push(childCopy);
    })

    return copy;
  }

  duplicate(){
    let metaCopy = cloneObject(this.getMeta());
    let newNode = RXNode.make<T>(metaCopy);
    newNode.parent = this.parent;
    newNode.moveAfter(this);
    return newNode;
  }

  getNode(id:number):RXNode<T>|undefined{
    if(id === this.id){
      return this;
    }
    for(var i = 0; i < this.children.length; i ++){
      const child = this.children[i];
      let childOfChild = child.getNode(id);
      if(childOfChild){
        return childOfChild
      }
    }

    return undefined;
  }

  remove(){
    this.parent && remove(this, this.parent?.children);
    this.parent = undefined;
  }

  moveBefore(target:RXNode<T>){
    this.remove();
    insertBefore(this, target, target.parent?.children);
    this.parent = target.parent;
  }

  moveAfter(target:RXNode<T>){
    this.remove();
    insertAfter(this, target, target.parent?.children);
    this.parent = target.parent;
  }

  moveIn(target:RXNode<T>){
    this.remove();    
    target.children.push(this);
    this.parent = target;
  }

  moveInTop(target:RXNode<T>){
    this.remove();    
    target.children = [this, ...target.children];
    this.parent = target;
  }  

  firstChild(){
    return first(this.children);
  }

  lastChild(){
    return last(this.children);
  }

  beforeBrother(){
    return before(this, this.parent?.children)
  }

  afterBrother(){
    return after(this, this.parent?.children)
  }

  getMeta(){
    let metaAny = cloneObject(this.meta);
    metaAny.children = [];
    this.children.forEach(child=>{
      metaAny.children.push(child.getMeta());
    })

    return metaAny;
  }

  //判断是否是某个节点的祖先
  isAncestorOf(targetId:number):boolean{
    if(!this.children){
      return false;
    }

    for(var i = 0; i < this.children.length; i++){
      if(this.children[i].id === targetId){
        return true;
      }
      if(this.children[i].isAncestorOf(targetId)){
        return true;
      }
    }

    return false;
  }

  //判断是否是某个节点的后代
  isPosterityOf(targetId:number):boolean{
    if(this.parent){
      if(this.parent.id === targetId){
        return true;
      }
      return this.parent.isPosterityOf(targetId)
    }
    return false;
  }

  exchangeTo(target:RXNode<T>){
    let targetMeta = target.meta;
    let targetChildren = target.children;
    let targetId = target.id;
    target.meta = this.meta;
    target.children = this.children;
    target.id = this.id;
    this.meta = targetMeta;
    this.children = targetChildren;
    this.id = targetId;
  }

} 