import aiohttp
import asyncio
import uvicorn
import base64 as b64
from fastai import *
from fastai.vision import *
from io import BytesIO
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles


from object_detection_fastai.helper.object_detection_helper import *
from object_detection_fastai.loss.RetinaNetFocalLoss import RetinaNetFocalLoss
from object_detection_fastai.models.RetinaNet import RetinaNet
from object_detection_fastai.callbacks.callbacks import BBLossMetrics, BBMetrics, PascalVOCMetric

# from cams import get_gradcam

# export_file_url = 'https://www.dropbox.com/s/shmd5gxcdodhdqk/export.pkl?raw=1'
export_file_url = 'https://drive.google.com/file/d/15p6WHScCdt8oQwbXN44P-Yd6SdKdIYUR/view?ts=5efc21cd'
export_file_name = 'export.pkl'

path = Path(__file__).parent

app = Starlette()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['X-Requested-With', 'Content-Type'])
app.mount('/static', StaticFiles(directory='app/static'))

async def download_file(url, dest):
    if dest.exists(): return
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.read()
            with open(dest, 'wb') as f:
                f.write(data)

async def setup_learner():
    await download_file(export_file_url, path/export_file_name)
    try:
        learn = load_learner(path, export_file_name)
        return learn
    except RuntimeError as e:
        if len(e.args) > 0 and 'CPU-only machine' in e.args[0]:
            print(e)
            message = "\n\nThis model was trained with an old version of fastai and will not work in a CPU environment.\n\nPlease update the fastai library in your training environment and export your model again.\n\nSee instructions for 'Returning to work' at https://course.fast.ai."
            raise RuntimeError(message)
        else:
            raise

loop = asyncio.get_event_loop()
tasks = [asyncio.ensure_future(setup_learner())]
learn = loop.run_until_complete(asyncio.gather(*tasks))[0]
loop.close()
classes = learn.data.classes

anchors = create_anchors(sizes=[(32,32),(16,16),(8,8),(4,4)], ratios=[0.5, 1, 2], scales=[0.35, 0.5, 0.6, 1, 1.25, 1.6])

@app.route('/')
async def homepage(request):
    html_file = path / 'view' / 'frontend.html'
    return HTMLResponse(html_file.open().read())

@app.route('/analyze', methods=['POST'])
async def analyze(request):
    img_data = await request.form()
    
    fname = img_data['fname']

    img_bytes = await (img_data['file'].read())
    img = open_image(BytesIO(img_bytes)).resize(256) # Golden fix

    def show_prediction(learn,img, detect_thresh = .25, nms_thresh = .1):
        with torch.no_grad():
            batch = learn.data.one_item(img)
            clas_pred, bbox_pred = learn.pred_batch(batch=batch)[:2]
            bbox_pred, scores, preds = process_output(clas_pred[0], bbox_pred[0], anchors, .25) # detect_thresh = 0.25
            classes = ['background', 'TBbacillus']
            if bbox_pred is not None:
                to_keep = nms(bbox_pred, scores, nms_thresh) # nms_thresh = 0.1
                bbox_pred, preds, scores = bbox_pred[to_keep].cpu(), preds[to_keep].cpu(), scores[to_keep].cpu()
                t_sz = torch.Tensor([*img.size])[None].cpu() 
                bbox_pred = to_np(rescale_boxes(bbox_pred, t_sz))
                # change from center to top left
                bbox_pred[:, :2] = bbox_pred[:, :2] - bbox_pred[:, 2:] / 2
            show_preds(img, bbox_pred, preds, scores, classes, (10, 10))
            

    
    # _,cat,prob = learn.predict(img)
    # conf, icats = torch.topk(prob,3)
    # conf = conf.numpy().astype(np.float)
    # cats = list(map(lambda x,y: [classes[x],y],icats,conf))
    # cams = list(map(lambda icat: get_gradcam(learn,img,icat),icats))
    # icams = list(map(lambda x,y: y + x,cats,cams)) 
    # return JSONResponse({'result': cats, 'cam': icams })

    show_prediction(learn,img) # need to use plt.savefig(BytesIO,format="png") to save it and perhaps use it as dataURI
    
    figfile = BytesIO()
    plt.savefig(figfile,format="png")

    figfile.seek(0)
    res = "data:image/png;base64," + b64.b64encode(figfile.getvalue()).decode('utf-8')

    return JSONResponse({"filename": "result_"+fname, "new_img": res})
    


if __name__ == '__main__':
    if 'serve' in sys.argv:
        uvicorn.run(app=app, host='0.0.0.0', port=8080, log_level="info") #, debug=True, reload=True)
