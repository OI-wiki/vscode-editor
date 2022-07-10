import {visit} from 'unist-util-visit';

interface Options{
  propertyName?:string,
  value?:string|number|string[]
}
export default function rehypeSourceLine(options?:Options) {
  return (tree:any) => {
    visit(tree, (node) => {
        if(node.position){
          if(!options||!options.propertyName&&!options.value){
            node.properties = {dataLine: node.position.start.line};
          }else{
            const propertyName = options.propertyName?options.propertyName:'dataLine';
            if(options.value){
              const { value } = options;
              if(Array.isArray(value)){
                const realValue = value.reduce((pre,cur)=>{
                  return pre[cur];
                },node);
                node.properties = {[propertyName]:realValue};
              }else{
                node.properties = {[propertyName]:value};
              }
            }else{
              node.properties = {[propertyName]:node.position.start.line};
            }
          }

        }
    });
  };
}