export {ReversibleGenerator}

class ReversibleGenerator {
    // seed needs to be a bigint or else
    constructor(seed) {
        this.a = BigInt("4645906587823291368");
        this.a_inv = BigInt("60091810420728157");
        this.m = BigInt(2**63) - BigInt(25);

        this.seed = seed;
        this.state = seed;
        this.index = 0;
    }

    // return a float in the interval [0,1]
    float() {
        return Number( this.state & BigInt(0xFFFFFFFF) )/(2**32);
    }
    // return a 32-bit integer
    integer() {
        return Number( this.state & BigInt(0xFFFFFFFF) );
    }

    // state control
    previous() {
        this.state = (this.state * this.a_inv) % this.m;
    }
    next() {
        this.state = (this.state * this.a) % this.m;
    }
}