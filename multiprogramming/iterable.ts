function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

// const iter = generator();

// iter.next()
// iter.next()
// console.log(iter.next())
// console.log(iter.next())
// for (const n of generator()) console.log(n);

function naturals(end = Infinity): IterableIterator<number> {
    let n = 1;
    return {
        next(): IteratorResult<number> {
            return n <= end ? { value: n++, done: false} : { value: undefined, done: true}
        },
        [Symbol.iterator](){
            return this
        }
    }

}

function constanct<T>(v: T): () =>T {
    return () => v
}


// const iter1 = naturals();
// // for(const n of iter1) console.log(n)

// console.log(iter1.next())
// console.log(iter1.next())
// console.log(iter1.next())


// const arr = [1,2,3];

// const iter = arr[Symbol.iterator]();

// for(const v of iter) console.log(v);


// const arr = [0, ...naturals(2)];
// console.log(arr);

function* map<T,U>(f:(a:T) => U, iter: Iterable<T>): IterableIterator<U> {
    for(const v of iter) {
        yield f(v)
    }
}

// const mapped = map((v) => v + 1 , naturals(10));
// const iter = mapped[Symbol.iterator]();
// console.log(iter.next())
// console.log([...iter])

// for (const a of mapped)
// console.log(a)

function forEach<T, U> (f:(v:T) => U, iterable: Iterable<T>): void {
    const iter = iterable[Symbol.iterator]();
    let result = iter.next()
    while(!result.done) {
        f(result.value);
        result = iter.next();
    }
}

// forEach(console.log,  naturals(3));


function* filter<T>(f:(v:T) => boolean, iterable:Iterable<T>):IterableIterator<T> {
    for(const v of iterable) {
        if(f(v)) yield v;
    }
}

// console.log([...filter((v) => v>2, [1,2,3])])

function baseReduce<T,U>(f:(acc:U, cur:T) => U, acc:U, iterator: Iterator<T>):U {
    while(true) {
        const {value, done} = iterator.next();
        if(done) break;
        acc = f(acc, value)
    }

    return acc;
}

function reduce<T,U>(f:(acc:U, c:T) => U, acc:U, iterable: Iterable<T>):U;
function reduce<T,U>(f:(acc:U, c:T) => U, iterable: Iterable<T>):U;


function reduce<T,U>(f:(acc:U|T, c:T) => U, accOrIterable:U|Iterable<T>, iterable?: Iterable<T> ):U {
    if(iterable === undefined) {
        const iterator = (accOrIterable as Iterable<T>)[Symbol.iterator]();
        const {value, done} = iterator.next()
        if(done) throw new TypeError("reduce of empty iterable with no initial value ")
        return baseReduce(f, value, iterator) as U;
    }else {
        return baseReduce(f, accOrIterable as U, iterable[Symbol.iterator]());
    }
}


function* take<A>(limit:number, iterable: Iterable<A>):IterableIterator<A> {
    const iterator = iterable[Symbol.iterator]();
    while(true) {
        const {value, done} =iterator.next();

        if(done) break;

        yield value;
        if( --limit === 0) break;
    }
}

function find<T>(f:(v: T) => boolean, iterable: Iterable<T>): T | undefined {
    return filter(f, iterable).next().value
}

const head = <T>(
    iterable: Iterable<T>
): T | undefined => iterable[Symbol.iterator]().next().value;

const v = find(v => v > 2, naturals(5));
// console.log(v);
// console.log(reduce((acc, v) => acc + v, 0, [1,2,3]))

function printNumber(n:number) {
    console.log(n);
}

function accumulateWith<A>(
    accumulator: (a: boolean, b: boolean) => boolean,
    acc:boolean,
    taking: (a: boolean) => boolean,
    f: (a: A) => boolean,
    iterable: Iterable<A>
) {


    return reduce(accumulator,acc, take(1,filter(taking,map(f, iterable))) )
}

function every<A>(f: (a: A) => boolean, iterable: Iterable<A>): boolean {
    // return fx(iterable).map(f).filter(a => a).take(1).reduce((a,c) => a && c, true)
    // return reduce((a, c)=> a && c, true,  take(1, filter( a => !a, map( f, iterable ))))
    return accumulateWith((a,b) => a && b, true, a => !a,f, iterable )
};

function some<A>(f: (a: A) => boolean, iterable: Iterable<A>): boolean {
    // return fx(iterable).map(f).filter(a => !a).take(1).reduce((a,c) => a || c, false)
    // return reduce((a, c)=> a || c, false,  take(1, filter( a => a, map( f, iterable ))))
    return accumulateWith((a,b) => a || b, false, a => a,f, iterable )
}

function* concat<A>(...iterables: Iterable<A>[]): IterableIterator<A> {
    for(const iterable of iterables) yield* iterable;
}

function* chunk<T>(size: number, iterable: Iterable<T>): IterableIterator<T[]> {
    const iterator = iterable[Symbol.iterator]();
    while(true) {
        const arr= [
            ...take(size, {
                [Symbol.iterator]() {
                    return iterator
                }
            }
            )
        ]
        if(arr.length) yield arr;
        if(arr.length < size) break;
    }
}


// console.log([...chunk(2, naturals(5))]);

// console.log(reduce((a, c)=> a && c, true,  take(1, filter( a => !a, map( v => v %2 === 1, [1,2,3] )))))

// console.log(every(v => v > 2, [0,1]))
// console.log(every(v => v > 2, [3,4]))
// console.log(some(v => v % 2 === 1, [2,5,6]))
// console.log(some(v => v % 2 === 1, [2,4,6]))

// console.log(every(v => v % 2 === 1, [1,3,5]));
// console.log(every(v => v % 2 === 1, [1,2,5]));

// console.log(every(v => v > 1, [1,2,3]));
// console.log(every(v => v > 1, [0]));

// forEach(printNumber, [reduce((acc, c) => acc += c,map(v => v + 1,filter(v => v % 2 ===0 , naturals(5))))])


export { generator, naturals, constanct, map, forEach, filter, reduce, printNumber, take, every, some, concat, chunk };