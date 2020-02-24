import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-input/paper-input.js';
import {
    mixinBehaviors
} from '@polymer/polymer/lib/legacy/class.js';

/**
 * `barcode-scanner`
 * Quagga Barcode Scanner wrapped in a Polymer element
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class BarcodeScanner extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        .input-group a{
          position: relative;
          top: 10px;
          left: 5px;
        }

        .drawingBuffer {
           position: absolute;
           left:0;
           top:0;
           width:100%;
        }

        #scanDialog{
          position:relative;
          width:100%
        }

        #scanDialog video{
          width:100%;
        }
        
      </style>
      <h2>Hello [[prop1]]!</h2>

      <div class="row">
        <div class="col-lg-6">
          <div class="input-group">
           <paper-input no-label-float label="Click the button to scan an EAN..." value="[[code]]" id="scanner_input" style="width:80%;display: inline-block;"></paper-input>           
              <a on-tap="_scan" id="btn"><img src="/barcode.png" preload sizing="cover"></a>    
          </div>
        </div>
      </div>

  <div id="scanDialog" class="sie"></div>   




    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'barcode-scanner',
      },
      result: {
          type: Object,
          notify: true,
          readOnly: true,
          value: null
        },
        code: {
          type: String,
          notify: true,         
        },
        _scannerIsRunning:{
          type:Boolean,
          value:false,
          notify:true
        }
    };
  }

  _startScan(){

    var _this = this;
    _this.set("code",'');
   
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: this.$.scanDialog,
            constraints: {
                facingMode: "environment"                     
            },
        },
         locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : [{
                    format: "ean_reader",
                    config: {}
                }]
            },
            locate: true        

    }, function (err) {
        if (err) {
            console.log(err);             
            return
        }
        
        console.log("Initialization finished. Ready to start");
        Quagga.start();
        _this.set('_scannerIsRunning',true);
    });
   
    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
        }
    });


    Quagga.onDetected(function (result) {

      if(result && result.codeResult && result.codeResult.code && result.codeResult.code.length == 13){        
        _this.set("code",result.codeResult.code);
         Quagga.stop();        
         return;
      }
    });  

  }

  _scan(){
    var _this = this;
    if (this._scannerIsRunning) {       
        var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;
        drawingCanvas.style.display = 'none';
        Quagga.stop();
        _this._startScan();
    } else {
        _this._startScan();
    }
  }

}

window.customElements.define('barcode-scanner', BarcodeScanner);
