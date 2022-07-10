// preview controller
(() => {
  
  
    class PreviewController {
      constructor(){
        
      }
  
      /* End of PreviewController class */
    }
    
    function onLoad() {
      /* tslint:disable-next-line:no-unused-expression */
      new PreviewController();
    }
    var previewController = new PreviewController();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onLoad);
    } else {
      onLoad();
    }
  })();