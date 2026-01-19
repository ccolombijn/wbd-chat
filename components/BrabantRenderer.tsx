'use client';

import parse, { domToReact, Element, DOMNode, attributesToProps } from 'html-react-parser';
import root from 'react-shadow';
import ChatBot from './ChatBot'; 

interface Props {
  htmlContent: string;
}

export default function BrabantRenderer({ htmlContent }: Props) {
  

  const cleanHtml = htmlContent
    .replace(/<!DOCTYPE html>/i, '')

    .replace(/<script id="__NEXT_DATA__"[\s\S]*?<\/script>/gi, '');

  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element) {
        
      
        if (domNode.name === 'script') {
            return <></>;
        }

       
        if (domNode.attribs.class && domNode.attribs.class.includes('SearchBar_searchBar__')) {
             return (
                 <div style={{ width: '100%', position: 'relative', zIndex: 100 }}>
                    <ChatBot />
                 </div>
             );
        }
        
    
        if (domNode.name === 'link' && domNode.attribs.rel === 'stylesheet') {
            return domToReact([domNode], options);
        }

        
        if (['html', 'head', 'body'].includes(domNode.name)) {
             return <>{domToReact(domNode.children as DOMNode[], options)}</>;
        }
      }
    },
  };

  return (
   
    <root.div mode="open">
      <style type="text/css">{`
        :host { 
          display: block; 
          all: initial; 
          background-color: #fff;
          font-family: Arial, sans-serif;
          /* De site gebruikt CSS variabelen op :root. In shadow dom is dat :host */
          --primary: #004491;
          --white: #fff;
          /* ... overige variabelen worden door de <style> in de HTML zelf geregeld */
        }
        
        /* Zorg dat de Next.js container van de broncode breedte pakt */
        #__next { width: 100%; isolation: isolate; }
        
        /* Fix voor afbeeldingen */
        img { max-width: 100%; height: auto; }
      `}</style>
      
     
      <div id="__next">
         {parse(cleanHtml, options)}
      </div>
    </root.div>
  );
}