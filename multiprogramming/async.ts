export = {};

function delay<T>(time:number, value: T): Promise<T> {
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
    return delay(size, {name, body: '...', size})
}

const settlePromise = <T>(promise: Promise<T>) => promise.then(value => ({status: 'fulfilled', value})).catch(reason => ({status:'rejected', reason}))


async function executeWithLimit<T>(promises: Promise<T>[], limit: number):Promise<T> {
    const result1 = await Promise.all([promises.s])
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
    // const files = await Promise.allSettled([
    //     getFile("img.png", 1500),
    //     getFile("book.pdf", 1000),
    //     getFile("index.html", 500),
    //     Promise.reject("fail...")
    // ])
    
    // const files = await Promise.allSettled([
    //     getFile("img.png", 1500),
    //     getFile("book.pdf", 1000),
    //     getFile("index.html", 500),
    //     Promise.reject("fail...")
    // ].map(settlePromise))
    try {

        const files = await Promise.any([
            getFile("img.png", 1500),
            getFile("book.pdf", 1000),
            getFile("index.html", 500),
            Promise.reject("fail...")
        ])
        
        console.log(files);
        
        const files2 = await Promise.any([
            delayReject(200, 'fail...'),
            delayReject(300, 'fail...'),
        ])
        
        console.log(files2)
    }catch(e) {
        console.error(e)
    }
}



(function main() {
    // renderFriendsPicker();
    getFiles2()

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
