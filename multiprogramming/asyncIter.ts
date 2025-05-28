import {delay, fromAsync} from "./async";
import { fx, isOdd } from "./FxIterable";
import { naturals } from "./iterable";


export async function* toAsync<T>(iterable: Iterable<T | Promise<T>>):AsyncIterableIterator<Awaited<T>> {
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

function* filterSync<A>(f:(a: A) => boolean, iterable: Iterable<A>):IterableIterator<A>  {
    for (const value of iterable) {
        if(f(value)) yield value; 
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

async function* filterAsync<A>(f:(a:A) => boolean | Promise<boolean>, asyncIterable: AsyncIterable<A>): AsyncIterableIterator<A>{
    for await (const value of asyncIterable) {
        if(await f(value)) yield value;
    }
}
type MapSync = <A, B>(f:(a:A) => B, iterable: Iterable<A>) => IterableIterator<B>;
type MapAsync = <A, B>(f:(a:A) => B, iterable: AsyncIterable<A>) => AsyncIterableIterator<Awaited<B>>;


function isIterable<T = unknown>(a:Iterable<T> | unknown): a is Iterable<T> {
    return typeof a?.[Symbol.iterator] === 'function';
}

export function map<A,B> (f:(a:A) => B, iterable: Iterable<A>): IterableIterator<B>;
export function map<A,B> (f:(a:A) => B, asyncIterable: AsyncIterable<A>): AsyncIterableIterator<Awaited<B>>;

export function map<A,B>(f:(a:A) => B, iterable: Iterable<A> | AsyncIterable<A>): IterableIterator<B> | AsyncIterableIterator<Awaited<B>> {
    return isIterable(iterable) ? mapSync(f, iterable) : mapAsync(f, iterable);
}


export function filter<A>(f:(a:A) => boolean, iterable:Iterable<A>): IterableIterator<A>;
export function filter<A>(f:(a:A) => boolean | Promise<boolean>, iterable:AsyncIterable<A>): AsyncIterableIterator<Awaited<A>>;

export function filter<A>(f:(a:A) => boolean | Promise<boolean>, iterable: Iterable<A> | AsyncIterable<A>): IterableIterator<A> | AsyncIterableIterator<A> { 
  return isIterable(iterable) ? filterSync(f as (a:A) => boolean, iterable) : filterAsync(f, iterable)
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

        const iter1: IterableIterator<string> = map((a) => a.toFixed(), [1,2,3]);
        const iter2: IterableIterator<Promise<string>> = map((a) => Promise.resolve(a.toFixed()), [1,2,3]);
        const iter3: AsyncIterableIterator<string> = map((a) => Promise.resolve(a.toFixed()), toAsync([1,2,3]));
        const iter4: AsyncIterableIterator<string> = map((a) => Promise.resolve(a.toFixed()), toAsync([Promise.resolve(1),2,3]));

        console.log([...map(a => a * 10, [1,2])])

        for await (const  v of map(a => delay(100, a * 10), toAsync([1,2]))) {
            console.log(v);
        }

        console.log(  await fromAsync(map(a => delay(100, a * 10), toAsync([1,2]))))

        console.log(await Promise.all(await fromAsync(map(a => delay(100, a * 10), toAsync([1,2])))))

        console.log( await Promise.all(map(a => delay(100, a * 10),[1,2])))

        const iterF1 = filter(a => a % 2 === 1, [1,2]);
        //   const iterF2 = filter(a => Promise.resolve(a % 2 === 1), [1,2]); 의도된 error
        const iterF3 = filter(a => a % 2 === 1, toAsync([1,2]));
        const iterF4 = filter(a => Promise.resolve(a % 2 === 1), toAsync([1,2]));

        console.log([...map(a => a * 10, filter(isOdd, naturals(4)))])

        const asyncIter2 :AsyncIterableIterator<string> = map(a => a.toFixed(2), filter(a => delay(1000, isOdd(a)), toAsync(naturals(4))))
        

        console.time("start")
        for await (const v of asyncIter2) {
            console.log(v);
        }

        console.log('end')
        console.timeEnd("start")
        
        console.time("start2")
        const a = await Promise.all(await fromAsync(map(a => a.toFixed(2), filter(a => delay(100, isOdd(a)), toAsync(naturals(4))))));
        console.log(a)
        console.timeEnd("start2")
        
        
        
        console.time("start3")
        console.log(await fromAsync(map(a => delay(1000, a * 10), toAsync(filter(isOdd, naturals(4))))));
        console.timeEnd("start3")
//    const mapped = mapAsync((v) => v + "c", string())
//    for await (const a of mapped) console.log(a);
}

async function test2() {
    const result = fx(naturals(4)).filter(isOdd).map(a => a * 10).reduce((a, c) => a + c, 0);

    const resultPromise = await fx(naturals(4)).filter(isOdd).map(a => a *10).toAsync().reduce((acc, a) => acc + a, 0)

    console.log(result, resultPromise)


}

(function main() {
    // test()
    test2()
})()
