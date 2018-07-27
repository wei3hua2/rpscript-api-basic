import {RpsContext,RpsModule,rpsAction} from 'rpscript-interface';
import { EventEmitter } from 'events';
import * as math from '../libs/mathjs/math.min';

/** Basic utility for rpscript. Contain basic operation such as condition, event listening, variable assignment, terminal print etc.
 * @namespace Basic
 * 
 * @example
 * rps install basic
*/
@RpsModule("basic")
export default class RPSBasic {

/**
 * @function console-log
 * @memberof Basic
 * @example
 * ;print 'Hello'
 * console-log 'Hello'
 * ;print 'Hello' again
 * console-log $RESULT
 * 
 * @param {string} text information to be printed out on the terminal.
 * @returns {*}  Similar to text input.
 * @summary print out text on console.
 * @description
 * This is a wrapper for javascript console.log function.
 * 
 * @see {@link https://www.w3schools.com/jsref/met_console_log.asp}
 * 
*/
  @rpsAction({verbName:'console-log'})
  async print(ctx:RpsContext,opts:{}, text:any) : Promise<any>{
    console.log(text);
    return text;
  }

  /**
 * @function as
 * @memberof Basic
 * @example
 * as 'varName' 1
 * ;print out the value 1
 * console-log $varName
 *
 * read 'filename.txt' | as 'varName'
 * ;this will print out the content of 'filename.txt'
 * console-log $varName
 * 
 * @param {string} variable Variable name.
 * @param {*} value  Value to be assigned to the variable.
 * @returns {*}  Value of the variable.
 * @summary Variable assignment.
 * @description
 * This is equivalent to variable assignment in programming language.
 * The assigned variable can be access by prefixing $ on the variable name.
 * 
 * 
*/
  @rpsAction({verbName:'as'})
  as (ctx:RpsContext,opts:{}, variable:string, value:any) : Promise<any>{
    variable = variable.trim();
    ctx.variables[variable] = value;

    if(variable.charAt(0)!=='$') variable = '$'+variable;

    ctx.variables[variable] = value;

    return Promise.resolve(value);
  }

/**
 * @function assign
 * @memberof Basic
 * 
 * @param {string} variable Variable name.
 * @param {*} value  Value to be assigned to the variable.
 * @returns {*}  Value of the variable.
 * @summary synonyms: as.
 * 
 * 
*/  
  @rpsAction({verbName:'assign'})
  assign (ctx:RpsContext,opts:{}, variable:string, value:any) : Promise<any>{
    variable = variable.trim();
    ctx.variables[variable] = value;

    if(variable.charAt(0)!=='$') variable = '$'+variable;

    ctx.variables[variable] = value;

    return Promise.resolve(value);
  }

  /**
 * @function once
 * @memberof Basic
 * @example
 * once 'connected' $emitter
 * 
 * @param {EventEmitter} event The object to listen to.
 * @param {string} eventName Name to listen for event.
 * @returns {*}  If condition is met, result of exec. else null.
 * @summary listen to event once
 * 
 * @see {@link https://nodejs.org/api/events.html#events_emitter_once_eventname_listener}
 * 
*/
  @rpsAction({verbName:'once'})
  once (ctx:RpsContext,opts:{}, event:EventEmitter, evtName:string) : Promise<any>{
    return new Promise(function(resolve) {
      event.once(evtName, (...params) => resolve(params));
    });
  }

/**
 * @function on
 * @memberof Basic
 * @example
 * on $emitter 'start' @ $output { console-log $output }
 * 
 * @param {EventEmitter} event The object to listen to.
 * @param {string} eventName Name to listen for event.
 * @returns {*}  If condition is met, result of exec. else null.
 * @summary listen to event once
 * 
 * @see {@link https://nodejs.org/api/events.html#events_emitter_once_eventname_listener}
 * 
*/
  @rpsAction({verbName:'on'})
  async on (ctx:RpsContext,opts:{}, event:EventEmitter, evtName:string, cb:(any)=>void) : Promise<EventEmitter>{
    event.on(evtName, (...params) => cb(params));
    return event;
  }

  /**
 * @function wait
 * @memberof Basic
 * @example
 * ;wait for 5 second
 * wait 5
 * 
 * @param {number} period Period to wait for in second.
 * @returns {*} Previous result.
 * @summary Pause the application for a period of time.
 * 
*/
  @rpsAction({verbName:'wait'})
  wait (ctx:RpsContext,opts:{}, period:number) : Promise<any>{
    return new Promise(function(resolve) {
      setTimeout(function () {
        resolve(ctx.$RESULT);
      }, period*1000);
    });
  }

/**
 * @function eval
 * @memberof Basic
 * @example
 * ;wait for 5 second
 * eval '1 + 2'
 * 
 * @param {string} alegbra The alegbra to apply.
 * @returns {*} result of the calculation.
 * @summary Evaluate a mathematical equation.
 * 
*/
  @rpsAction({verbName:'eval'})
  async evaluate (ctx:RpsContext,opts:Object, expression:string, ...args:any[]) : Promise<any>{
    let retFn = opts['function'];
    let expr = math.compile(expression);

    let objArg = this.argMapToObj(args);
    var that = this;

    let lateFn = function (...fnargs:any[]) { 
      let allArgs = args.concat(fnargs);
      let objArg = that.argMapToObj(allArgs);

      return expr.eval(objArg); 
    }

    if(retFn===true) return lateFn;
    else if(retFn===false) return expr.eval(objArg);
    else if(objArg) return expr.eval(objArg);
    else return lateFn;
  }

/**
 * @function abs
 * @memberof Basic
 * @example
 * ;absolute value
 * abs -5.1
 * 
 * @param {number} number 
 * @returns {number} Absolute number.
 * 
*/
@rpsAction({verbName:'abs'})
async abs (ctx:RpsContext,opts:{}, num:number) : Promise<number>{
  return Math.abs(num);
}
/**
 * @function ceil
 * @memberof Basic
 * @example
 * ;ceil value
 * ceil 5.1
 * 
 * @param {number} number 
 * @returns {number} Absolute number.
 * 
*/
@rpsAction({verbName:'ceil'})
async ceil (ctx:RpsContext,opts:{}, num:number) : Promise<number>{
  return Math.ceil(num);
}
/**
 * @function max
 * @memberof Basic
 * @example
 * ;max value
 * max 5.1 1.2 3.3
 * 
 * @param {number} number 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'max'})
async max (ctx:RpsContext,opts:{}, ...num:number[]) : Promise<number>{
  return Math.max.apply(this,num);
}
/**
 * @function min
 * @memberof Basic
 * @example
 * ;min value
 * min 5.1 1.2 3.3
 * 
 * @param {...number} number 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'min'})
async min (ctx:RpsContext,opts:{}, ...num:number[]) : Promise<number>{
  return Math.min.apply(this,num);
}
/**
 * @function floor
 * @memberof Basic
 * @example
 * ;floor value
 * floor 5.1
 * 
 * @param {number} number 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'floor'})
async floor (ctx:RpsContext,opts:{}, num:number) : Promise<number>{
  return Math.floor(num);
}
/**
 * @function power
 * @memberof Basic
 * @example
 * ;power value
 * power 5 3
 * 
 * @param {number} x
 * @param {number} y 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'pow'})
async power (ctx:RpsContext,opts:{}, x:number, y:number) : Promise<number>{
  return Math.pow(x,y);
}
/**
 * @function random
 * @memberof Basic
 * @example
 * ;random
 * random 
 * 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'random'})
async random (ctx:RpsContext,opts:{}) : Promise<number>{
  return Math.random();
}
/**
 * @function round
 * @memberof Basic
 * @example
 * ;round
 * round 1.3
 * 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'round'})
async round (ctx:RpsContext,opts:{},num:number) : Promise<number>{
  return Math.round(num);
}
/**
 * @function trunc
 * @memberof Basic
 * @example
 * ;trunc
 * trunc 1.3
 * 
 * @returns {number} number.
 * 
*/
@rpsAction({verbName:'trunc'})
async trunc (ctx:RpsContext,opts:{},num:number) : Promise<number>{
  return Math.trunc(num);
}

  private argMapToObj (args:any[]) : Object{
    if(!args || args.length == 0) return undefined;

    let obj = {};
    let initCharCode = 'a'.charCodeAt(0);

    for(var i =0;i<args.length;i++){
      let alphabet = String.fromCharCode(initCharCode + i);
      obj[alphabet] = args[i];
    }

    return obj;
  }


}
