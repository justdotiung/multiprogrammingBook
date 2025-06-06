import { fx } from "./FxIterable";

function loadImage(url: string) : Promise<HTMLImageElement>{

    return new Promise( (resolve, reject) => {
        const image = new Image()
        image.src = url;
        image.onload = () => {
            resolve(image);
        }

        image.onerror = (err)=> {
            reject(new Error(`load error: ${err}`))
        }
    })
}

async function calcTotalHeight(urls: string[])  {
    try {
        const totalHeight = await urls.map(async (url)=>{ 
            const img = await loadImage(url)
            return img.height;
        }).reduce(async (a, c) => await a+ await c,  Promise.resolve(0))

        return totalHeight

    }catch (err) {
    console.error("error :", err)
    }
}

async function calcTotalHeight2(urls: string[]) {
    try {
        const totalHeight = await fx(urls).toAsync().map(loadImage).map(img => img.height).reduce((a ,b) =>  a + b, 0)
        return totalHeight;
    }catch(err) {
        console.log('error:', err)
    }
} 
`   `
const getTotalHeight =  (urls: string[]) => fx(urls).toAsync().map(loadImage).map(img => img.height).reduce((a,b) => a + b, 0);

async function foo(urls: string[]) {
    try {
        return await getTotalHeight(urls)
    } catch (error) {
        console.log('error:', error);
    }
}

// foo(['/images.png']);
// calcTotalHeight2(['/images.png']);
calcTotalHeight(['/images.png','images2.png']);