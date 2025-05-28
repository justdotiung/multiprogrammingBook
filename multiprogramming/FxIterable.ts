import { chunk, filter, forEach, map, naturals, reduce as old, take } from "./iterable";
import {map as asyncMap, filter as asyncFilter, toAsync } from "./asyncIter"
import { fromAsync } from "./async";


function isIterable<T = unknown>(a:Iterable<T> | unknown): a is Iterable<T> {
    return typeof a?.[Symbol.iterator] === 'function';
}

function fx<T>(iterable: Iterable<T>):FxIterable<T>;
function fx<T>(iterable: AsyncIterable<T>): FxAsyncIterable<T>;

function fx<T>(iterable: Iterable<T> | AsyncIterable<T>): FxIterable<T> | FxAsyncIterable<T> {
    return isIterable(iterable) ? new FxIterable(iterable) : new FxAsyncIterable(iterable);
}



function reduce<A,Acc>(f:(acc:Acc, c: A) => Acc, acc:Acc, iterable: Iterable<A>): Acc;
function reduce<A,Acc>(f:(acc:Acc, c: A) => Acc | Promise<Acc>, acc: Acc, asyncIterable: AsyncIterable<A>):  Promise<Acc>;
function reduce<A,Acc>(f:any, acc: Acc, iterable: Iterable<A>| AsyncIterable<A>): Acc|Promise<Acc> {
    return isIterable(iterable) ? reduceSync(f, acc, iterable) : reduceAsync(f, acc, iterable);
}

function reduceSync<A, Acc>(f: (a:Acc, c:A) => Acc, acc: Acc, iterable: Iterable<A>): Acc {
    for (const a of iterable) {
        acc = f(acc, a);
    }
    return acc;
}


async function reduceAsync<A, Acc>(f:(a:Acc, c:A) => Acc | Promise<Acc>, acc: Acc, asyncIterable: AsyncIterable<A>):Promise<Acc> {
    for await (const c of asyncIterable) {
        acc = await f(acc, c)
    }
    return acc;
}



class FxIterable<T> {
    constructor(private iterable:Iterable<T>){}

    [Symbol.iterator]() {
        return this.iterable[Symbol.iterator]();
    }

    map<B>(f: (a:T) => B): FxIterable<B> {
        return new FxIterable(map(f, this.iterable));
    }

    filter(f: (a:T) => boolean): FxIterable<T> {
        return fx(filter(f, this.iterable));
    }

    forEach(f:(a: T) => void) :void {
        forEach(f, this.iterable);
    }

    // reduce<Acc> (f:(acc:Acc, c :T) => Acc, acc:Acc): Acc;
    // reduce<Acc> (f:(acc:T, c :T) => Acc): Acc;
    reduce<Acc> (f:(acc:Acc | T, c :T) => Acc, acc:Acc): Acc {
            return reduce(f, acc, this)
    }

    toArray():T[] {
        return [...this.iterable];
    }

    to<U>(converter: (a:this) =>  U): U {
        return converter(this)
    }

    reject(f: (a:T) => boolean):FxIterable<T> {
        return this.filter(v => !f(v));
    }

    chain<U>(f:(Iterable: this) => Iterable<U>):FxIterable<U> {
        return fx(f(this));
    }

    take(limit: number): FxIterable<T> {
        return fx(take(limit, this));
    }

    chunk(size: number): FxIterable<T[]> {
        return fx(chunk(size, this))
    }

    toAsync() {
        return fx(toAsync(this))
    }
}

class FxAsyncIterable<T> {
    constructor(private asyncIterable: AsyncIterable<T>) {}

    [Symbol.asyncIterator]() { return this.asyncIterable[Symbol.asyncIterator]()}

    map<B>(f:(a:T) => B){
        return fx(asyncMap(f, this))
    }

    filter(f:(a:T) => boolean | Promise<boolean>) {
        return fx(asyncFilter(f, this))
    }

    reduce<Acc>(f:(a:Acc, c:T) => Acc | Promise<Acc>, acc: Acc) {
        return reduce(f, acc, this)
    }

    toArray(): Promise<T[]> {
        return fromAsync(this);
    }
}


export const isOdd = (a: number) => a % 2 === 1;
// const result = fx([1,2,3,1,2,3,12]).filter(isOdd).map( v => v + 10).chain(iter => new Set(iter)).reduce((a,v) => a+ v)
// console.log(result)

// const sorted = fx(naturals(5)).filter(v => v % 2 === 1).map(n => n * 10).to(iter => [...iter]).sort((a,b) => a -b)//.forEach(console.log)
// console.log(sorted)


// const [first, second] =  fx(naturals(10)).map(v => v + 10).reject(isOdd);
// console.log(first, second)


// const v = fx(['a','b']).filter(v => v === 'a').map(v => v.toLocaleUpperCase()).reduce((acc, v) => acc + `${v}cc`, '')//.forEach(console.log);
// console.log(v)

export {fx}

