
function accumulateWith<A>(
    accumulator: (a: boolean, b: boolean) => boolean,
    acc:boolean,
    taking: (a: boolean) => boolean,
    f: (a: A) => boolean,
    iterable: Iterable<A>
) {
    return fx(iterable).map(f).filter(taking).take(1).reduce(accumulator, acc);
}

function every<A>(f: (a: A) => boolean, iterable: Iterable<A>): boolean {
    // return fx(iterable).map(f).filter(a => a).take(1).reduce((a,c) => a && c, true)
    return accumulateWith((a,b) => a && b, true, a => a,f, iterable )
};

function some<A>(f: (a: A) => boolean, iterable: Iterable<A>): boolean {
    // return fx(iterable).map(f).filter(a => !a).take(1).reduce((a,c) => a || c, false)
    return accumulateWith((a,b) => a || b, false, a => !a,f, iterable )
}

function* concat<A>(...iterables: Iterable<A>[]): IterableIterator<A> {
    for(const iterable of iterables) yield* iterable;
}
