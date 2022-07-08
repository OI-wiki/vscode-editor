import {visit} from 'unist-util-visit';

export default function rehypeSourceLine() {
  return (tree:any) => {
    visit(tree, (node) => {
        if(node.position){
          node.properties = {dataLine: node.position.start.line};
        }
    });
  };
}