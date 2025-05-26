import { chunk, filter, forEach, map, naturals, reduce, take } from "./iterable";


function fx<T>(iterable: Iterable<T>):FxIterable<T> {
    return new FxIterable(iterable);
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

    reduce<Acc> (f:(acc:Acc, c :T) => Acc, acc:Acc): Acc;
    reduce<Acc> (f:(acc:T, c :T) => Acc): Acc;
    reduce<Acc> (f:(acc:Acc | T, c :T) => Acc, acc?:Acc): Acc {
         return acc === undefined
            ? reduce(f, this.iterable)
            : reduce(f, acc, this.iterable)
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
}


const isOdd = (a: number) => a % 2 === 1;
// const result = fx([1,2,3,1,2,3,12]).filter(isOdd).map( v => v + 10).chain(iter => new Set(iter)).reduce((a,v) => a+ v)
// console.log(result)

// const sorted = fx(naturals(5)).filter(v => v % 2 === 1).map(n => n * 10).to(iter => [...iter]).sort((a,b) => a -b)//.forEach(console.log)
// console.log(sorted)


// const [first, second] =  fx(naturals(10)).map(v => v + 10).reject(isOdd);
// console.log(first, second)


// const v = fx(['a','b']).filter(v => v === 'a').map(v => v.toLocaleUpperCase()).reduce((acc, v) => acc + `${v}cc`, '')//.forEach(console.log);
// console.log(v)

export {fx}