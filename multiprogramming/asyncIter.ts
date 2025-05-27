import { delay } from "./async";
import { fx } from "./fxIterable";

export = {};

async function* toAsync<T>(iterable: Iterable<T | Promise<T>>):AsyncIterableIterator<Awaited<T>> {
    for await (const value of iterable) {
        yield value
    }
}

function mapSync<A,B>(f: (a:A) => B, iterable:Iterable<A>): IterableIterator<B> {
    const iterator = iterable[Symbol.iterator]();
    return {
        next() {
            const {done , value } =iterator.next();
            return done ? {value, done} : { value: f(value), done};
        },
        [Symbol.iterator](){
            return this
        }
    }
}

function mapAsyncIterator<A,B>(f: (a:A) => B, iterable:AsyncIterable<A>):AsyncIterableIterator<Awaited<B>> {
    const iterator = iterable[Symbol.asyncIterator]();
    return {
        async next(){
            const {value, done} = await iterator.next();
            return done ?  {value, done} : {value: await f(value), done};

        },

        [Symbol.asyncIterator](){
            return this;
        }
    }
}

async function* mapAsync<A,B> (f:(a:A) => B, iterable: AsyncIterable<A>):AsyncIterableIterator<Awaited<B>> {
    for await (const value of iterable) {
            yield f(value);
    }
}

function* filterSync<A>(f:(a: A) => boolean, iterable: Iterable<A>):IterableIterator<A>  {
    for (const value of iterable) {
        if(f(value)) yield value; 
    }
}

async function* filterAsync<A>(f:(a:A) => boolean | Promise<boolean>, asyncIterable: AsyncIterable<A>): AsyncIterableIterator<A>{
    for await (const value of asyncIterable) {
        if(await f(value)) yield value;
    }
}

async function* string() {
    yield delay(1000, '5');
    yield delay(500, "a");
}

async function* numbers(): AsyncIterableIterator<number> {
    yield 1;
    yield 2;
}

async function test() {
        for await (const a of mapAsync((v) => v * 2, numbers())) {
            console.log(a)
        }

        for await (const a of mapAsync((v) => v * 2, toAsync([1,2]))) {
            console.log(a)
        }

        for await (const a of mapAsync((v) => delay(100,v * 2), toAsync([1,2]))) {
            console.log(a)
        }
        
        for await (const a of filterAsync((v) => v  === 2, toAsync([1,2]))) {
            console.log(a)
        }
        
        for await (const a of filterAsync((v) => delay(100,v  === 2), toAsync([1,2]))) {
            console.log(a)
        }
//    const mapped = mapAsync((v) => v + "c", string())
//    for await (const a of mapped) console.log(a);
}

(function main() {
test()
})()
