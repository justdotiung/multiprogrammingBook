
function delay<T>(time:number, value: T): Promise<T> {
    return new Promise((r)=> setTimeout(r, time, value));
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

(async function test3() {
    const result = await Promise.race([getFriends(), delay(5000, "timeout")]);
    

    if(result === 'timeout') {
        console.log('network error')
    }else {
        const friends = result as User[];
        console.log("rendering", friends.map(({name}) => `<li>${name}</li>`))
    }
})()

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
