import { fx } from "./FxIterable";

export function delay<T>(time:number, value: T): Promise<T> {
    return new Promise((r)=> setTimeout(r, time, value))
}

function delayReject(time:number, value: unknown): Promise<never> {
    return new Promise((_,j)=> setTimeout(j, time, value));
}


function getRandomValue<T>(a:T, b:T):T {
    const randomIndex = Math.floor(Math.random() * 2);
    return randomIndex === 0 ? a: b;
}


type User = {
    name:string;
}

function getFriends(): Promise<User[]> {
    return delay(getRandomValue(60, 6000), [{name: "Marty"}, {name: "black"}, {name: "yellow"}])
}

function toggleLoadingIndicator(isShow:boolean):void {
    if(isShow) {
        console.log('append loading...')
    }else {
        console.log('remove loading...')
    }
}

async function renderFriendsPicker():Promise<void> {
    const friendsPromise = getFriends();

    const result = await Promise.race([friendsPromise, delay(100, 'isShow')])

    if(result === 'isShow') {
        toggleLoadingIndicator(true);
        await friendsPromise;
        toggleLoadingIndicator(false)
    }

    const friends = await friendsPromise;
    console.log("rendering", friends.map(({name}) => `<li>${name}</li>`))

}



type File = {
    name: string;
    body: string;
    size: number;
}

function getFile(name:string, size = 1000): Promise<File> {
    console.log(123)
    return delay(size, {name, body: '...', size})
}

const settlePromise = <T>(promise: Promise<T>) => promise.then(value => ({status: 'fulfilled', value})).catch(reason => ({status:'rejected', reason}))


// fx([1,2,3,4,5]).chunk(2).forEach(arr => console.log(arr))


export async function fromAsync<T>(iterable : Iterable<Promise<T>>| AsyncIterable<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const a of iterable) {
        arr.push(a)
    }
    
    return arr;
}


async function executeWithLimit<T>(fs: (() => Promise<T>)[], limit: number):Promise<T[]> {
    return fx(fs)
    .map(f => f())
    .chunk(limit)
    .map(ps => Promise.all(ps))
    .to(fromAsync)
    .then(arr => arr.flat())
}

async function test5() {
    const files: File[] = await executeWithLimit([
        () => getFile("Image.png"),
        () => getFile("Image.png"),
        () => getFile("Image.png"),
        () => getFile("Image.png"),
        // () => getFile("Image.png"),
        // () => getFile("Image.png"),
        // () => getFile("Image.png"),
        // () => getFile("Image.png"),
        // () => getFile("Image.png"),
        // () => getFile("Image.png"),
    ], 3)

    console.log(files);
}



async function getFiles() {
    try {
        const files = await Promise.all([
            getFile("img.png", 1500),
            getFile("book.pdf", 1000),
            getFile("index.html", 500),
            delayReject(500,'fail....')
            
        ])
        console.log(files)
    } catch(e) {
        console.error(e)
    }
}



async function getFiles2() {
    try {

        await delay(500,Promise.reject("fail..."))
    }catch(e) {
        console.error(e)
    }
}

async function* stringsAsyncTest() {
    yield delay(1000, "a");

    const b = await delay(500, "b") + "c";

    yield b;
}

async function test6() {
    const asyncItertor:AsyncIterableIterator<string> = stringsAsyncTest()
    const result1 = await asyncItertor.next();
    console.log(result1.value)
    const result2 = await asyncItertor.next()
    console.log(result2.value)

    const { done } = await asyncItertor.next();

    console.log(done);
}

function toAsync2<T>(iterable:Iterable<T|Promise<T>>):AsyncIterable<Awaited<T>> {
    return  {
        [Symbol.asyncIterator]():AsyncIterable<Awaited<T>> {
            const iterator = iterable[Symbol.iterator]();
            return {
                async next() {
                    const { value, done} = iterator.next();
                    return done ? {value, done} : { value : await value, done }
                }
            
            }
        }
    }
}


async function test7() {
    const asyncIterable =toAsync2([1]);
    const asyncIterator = asyncIterable[Symbol.asyncIterator]();
    await asyncIterator.next().then(({value}) => console.log(value));
    await asyncIterator.next().then(({value}) => console.log(value));

    const asyncIterable2 = toAsync2([Promise.resolve('a')])
    const asyncIterator2 = asyncIterable2[Symbol.asyncIterator]();
    await asyncIterator2.next().then(({value}) => console.log(value))
    await asyncIterator2.next().then((value) => console.log(value))
}

async function test11() {
    for await ( const a of toAsync2([1,2])) console.log(a);
    for await ( const a of toAsync2([Promise.resolve(11),Promise.resolve(22)])) console.log(a);
    for await ( const a of [1,2]) console.log(a);
    for await ( const a of [ Promise.resolve(11),Promise.resolve(22)]) console.log(a);
}

( function main() {
    // renderFriendsPicker();
    // getFiles2()
    // test5();
    // test6()
    //  test7()
    // test11()
})()

async function test3 (){
    const result = await Promise.race([getFriends(), delay(5000, "timeout")]);


    if(result === 'timeout') {
        console.log('network error')
    }else {
        const friends = result as User[];
        console.log("rendering", friends.map(({name}) => `<li>${name}</li>`))
    }

}
function test() {
    console.time("test");

    delay(1000, "1").then((v) => {
        console.log(v);
        console.timeEnd("test")
    })


}
async function test2() {
    console.time("test2");

    const v = await delay(1000, "1");
    
    console.log(v);
    console.timeEnd("test2")
}
