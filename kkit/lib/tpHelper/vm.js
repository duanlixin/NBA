/**
 * @describe:
 * @time: 上午11:42
 * @author: Knight
 * @version: 0.0.1
 */

define(function (require, exports, module) {
    var Velocity = function (asts) {
        this.asts = asts;
        this.init();
    };
    Velocity.Helper = {};
    Velocity.prototype = {
        constructor: Velocity
    };

    var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString'));

    var keys = Object.keys || function (o) {
        var result = [], p, i;

        for (p in o) {
            result.push(p);
        }

        if (hasEnumBug) {
            for (i = enumProperties.length - 1; i >= 0; i--) {
                p = enumProperties[i];
                if (o.hasOwnProperty(p)) {
                    result.push(p);
                }
            }
        }

        return result;
    };

    //api map
    "use strict";
var utils = {};

['forEach', 'some', 'every', 'filter', 'map'].forEach(function(fnName){
  utils[fnName] = function(arr, fn, context){
    if (!arr || typeof arr == 'string') return arr;
    context = context || this;
    if (arr[fnName]){
      return arr[fnName](fn, context);
    } else {
      var keys = Object.keys(arr);
      return keys[fnName](function(key){
        return fn.call(context, arr[key], key, arr);
      }, context);
    }
  };
});

var number = 0;
utils.guid = function(){
  return number++;
};

utils.mixin = function (to, from){
  utils.forEach(from, function(val, key){
    var toString = {}.toString.call(val);
    if (utils.isArray(val) || utils.isObject(val)) {
      to[key] = utils.mixin(val, to[key] || {});
    } else {
      to[key] = val;
    }
  });
  return to;
};

utils.isArray = function(obj){
  return {}.toString.call(obj) === '[object Array]';
};

utils.isObject = function(obj){
  return {}.toString.call(obj) === '[object Object]';
};

utils.indexOf = function(elem, arr){
  if (utils.isArray(arr)) {
    return arr.indexOf(elem);
  }
};

utils.keys = Object.keys;
utils.now  = Date.now;

function makeLevel(block, index){

  var blockTypes = {
    'if': 1,
    'foreach': 1,
    'macro': 1,
    'noescape': 1,
    'define': 1
  };

  var len = block.length;
  index = index || 0;
  var ret = [];
  var ignore = index - 1;

  for (var i = index; i < len; i++) {

    if (i <= ignore) continue;

    var ast = block[i];
    var type = ast.type;

    if (!blockTypes[type] && type !== 'end') {

      ret.push(ast);

    } else if (type === 'end') {

      return {arr: ret, step: i};

    } else {

      var _ret = makeLevel(block, i + 1);
      ignore = _ret.step;
      _ret.arr.unshift(block[i]);
      ret.push(_ret.arr);

    }

  }

  return ret;
}

utils.makeLevel = makeLevel;




    !function(Helper, utils){
    /**
     * 获取引用文本，当引用自身不存在的情况下，需要返回原来的模板字符串
     */
    function getRefText(ast){
  
      var ret = ast.leader;
      var isFn = ast.args !== undefined;
  
      if (ast.type === 'macro_call') {
        ret = '#';
      }
  
      if (ast.isWraped) ret += '{';
  
      if (isFn) {
        ret += getMethodText(ast);
      } else {
        ret += ast.id;
      }
  
      utils.forEach(ast.path, function(ref){
        //不支持method并且传递参数
        if (ref.type == 'method') {
          ret += '.' + getMethodText(ref);
        } else if (ref.type == 'index') {
  
          var text = '';
          var id = ref.id;
  
          if (id.type === 'integer') {
  
            text = id.value;
  
          } else if (id.type === 'string') {
  
            var sign = id.isEval? '"': "'";
            text = sign + id.value + sign;
  
          } else {
  
            text = getRefText(id);
  
          }
  
          ret += '[' + text + ']';
  
        } else if (ref.type == 'property') {
  
          ret += '.' + ref.id;
  
        }
  
      }, this);
  
      if (ast.isWraped) ret += '}';
  
      return ret;
    }
  
    function getMethodText(ref) {
  
      var args = [];
      var ret = '';
  
      utils.forEach(ref.args, function(arg){
        args.push(getLiteral(arg));
      });
  
      ret += ref.id + '(' + args.join(',') + ')';
  
      return ret;
  
    }
  
    function getLiteral(ast){
  
      var ret = '';
  
      switch(ast.type) {
  
        case 'string': {
          var sign = ast.isEval? '"': "'";
          ret = sign + ast.value + sign;
          break;
        }
  
        case 'integer':
        case 'bool'   : {
          ret = ast.value;
          break;
        }
  
        case 'array': {
          ret = '[';
          var len = ast.value.length - 1;
          utils.forEach(ast.value, function(arg, i){
            ret += getLiteral(arg);
            if (i !== len) ret += ', ';
          });
          ret += ']';
          break;
        }
  
        default:
          ret = getRefText(ast)
      }
  
      return ret;
    }
  
    Helper.getRefText = getRefText;
  }(Velocity.Helper, utils);

    'use strict';
  /** file: ./src/compile/blocks.js*/
  !function(Velocity, utils){
  
    /**
     * blocks语法处理
     */
    utils.mixin(Velocity.prototype, {
      /**
       * 处理代码库: if foreach macro
       */
      getBlock: function(block) {
  
        var ast = block[0];
        var ret = '';
  
        switch (ast.type) {
          case 'if':
            ret = this.getBlockIf(block);
            break;
          case 'foreach':
            ret = this.getBlockEach(block);
            break;
          case 'macro':
            this.setBlockMacro(block);
            break;
          case 'noescape':
            ret = this._render(block.slice(1));
            break;
          case 'define':
            this.setBlockDefine(block);
            break;
          default:
            ret = this._render(block);
        }
  
        return ret || '';
      },
  
      /**
       * define
       */
      setBlockDefine: function(block){
        var ast = block[0];
        var _block = block.slice(1);
        var defines = this.defines;
  
        defines[ast.id] = _block;
      },
  
      /**
       * define macro
       */
      setBlockMacro: function(block){
        var ast = block[0];
        var _block = block.slice(1);
        var macros = this.macros;
  
        macros[ast.id] = {
          asts: _block,
          args: ast.args
        };
      },
  
      /**
       * parse macro call
       */
      getMacro: function(ast){
        var macro = this.macros[ast.id];
        var ret = '';
  
        if (!macro) {
  
          var jsmacros = this.jsmacros;
          macro = jsmacros[ast.id];
          var jsArgs = [];
  
          if (macro && macro.apply) {
  
            utils.forEach(ast.args, function(a){
              jsArgs.push(this.getLiteral(a));
            }, this);
  
            var self = this;
            if (!jsmacros.eval) {
              jsmacros.eval = function() {
                return self.eval.apply(self, arguments);
              };
            }
  
            jsmacros.context = this.context;
  
            try {
              ret = macro.apply(jsmacros, jsArgs);
            } catch(e){
              getErrorMessage(ast, e, jsArgs);
            }
  
          }
  
        } else {
          var asts = macro.asts;
          var args = macro.args;
          var _call_args = ast.args;
          var local = {};
          var localKey = [];
          var guid = utils.guid();
          var contextId = 'macro:' + ast.id + ':' + guid;
  
          utils.forEach(args, function(ref, i){
            if (_call_args[i]) {
              local[ref.id] = this.getLiteral(_call_args[i]);
            } else {
              local[ref.id] = undefined;
            }
          }, this);
  
          ret = this.eval(asts, local, contextId);
        }
  
        return ret;
      },
  
      /**
       * eval
       * @param str {array|string} 需要解析的字符串
       * @param local {object} 局部变量
       * @param contextId {string} 
       * @return {string}
       */
      eval: function(str, local, contextId){
  
        if (!local) {
  
          if (utils.isArray(str)) {
            return this._render(str);
          } else {
            return this.evalStr(str);
          }
  
        } else {
  
          var asts = [];
          var Parser = Velocity.Parser;
          contextId = contextId || ('eval:' + utils.guid());
  
          if (utils.isArray(str)) {
  
            asts = str;
  
          } else if (Parser) {
  
            asts = Parser.parse(str);
  
          }
  
          if (asts.length) {
  
            this.local[contextId] = local;
            var ret = this._render(asts, contextId);
            this.local[contextId] = {};
            this.conditions.shift();
            this.condition = this.conditions[0] || '';
  
            return ret;
          }
  
        }
  
      },
  
      /**
       * parse #foreach
       */
      getBlockEach: function(block){
  
        var ast = block[0];
        var _from = this.getLiteral(ast.from);
        var _block = block.slice(1);
        var _to = ast.to;
        var local = {
          foreach: {
            count: 0
          }
        };
        var ret = '';
        var guid = utils.guid();
        var contextId = 'foreach:' + guid;
  
        var type = ({}).toString.call(_from);
        if (!_from || (type !== '[object Array]' && type !== '[object Object]')) return;
  
        var len = utils.isArray(_from)? _from.length: utils.keys(_from).length;
  
        utils.forEach(_from, function(val, i){
  
          if (this.setBreak) return;
          //构造临时变量
          local[_to] = val;
          //TODO: here, the foreach variable give to local, when _from is not an
          //array, count and hasNext would be undefined, also i is not the
          //index.
          local['foreach']['count'] = i + 1;
          local['foreach']['index'] = i;
          local['foreach']['hasNext'] = i + 1 < len;
          local['velocityCount'] = i + 1;
          this.local[contextId] = local;
          ret += this._render(_block, contextId);
  
        }, this);
  
        this.setBreak = false;
        //删除临时变量
        this.local[contextId] = {};
        this.conditions.shift();
        this.condition = this.conditions[0] || '';
  
        return ret;
  
      },
  
      /**
       * parse #if
       */
      getBlockIf: function(block) {
  
        var str = '';
        var received = false;
        var asts = [];
  
        utils.some(block, function(ast){
  
          if (ast.condition) {
  
            if (received) return true;
            received = this.getExpression(ast.condition);
  
          } else if (ast.type === 'else') {
            if (received) return true;
            received = true;
          } else if (received) {
            asts.push(ast);
          }
  
          return false;
  
        }, this);
  
        return this._render(asts);
      }
    });
  
    function getErrorMessage(ast, e, args) {
      var pos = ast.pos;
      var text = Velocity.Helper.getRefText(ast);
      // throws error tree
  
      var stacks = e.stack.split('\n');
      var msgs = [''];
      var spase = stacks[1].replace(/^(\s+)\w[\s\S]+$/, '$1');
      var err = spase + 'at ' + text + ' L/N ' + pos.first_line + ':' +
        pos.first_column + ', args: '+ args;
  
      stacks.some(function(msg, i) {
        if (msg.indexOf('Velocity.utils.mixin.getMacro') > -1) {
          return true;
        }
  
        if (i && msg.indexOf('getErrorMessage') === -1) {
          msgs.push(msg);
        }
      });
      msgs.push(err);
      e.message += msgs.join('\n');
      e.name = '';
  
      throw new Error(e);
    }
  }(Velocity, utils);
  
  'use strict';
  /** file: ./src/compile/compile.js*/
  !function(Velocity, utils) {
  
    function step(arr, i) {
      var result = '';
      i = i || 0;
      if (!arr[i]) {
        return Promise.resolve('');
      }
  
      return new Promise(function(resolve) {
        arr[i]().then(function(ret) {
          result += ret;
          step(arr, i + 1).then(function(ret) {
            result += ret;
            resolve(result);
          });
        });
      });
    }
  
    /**
     * compile
     */
    utils.mixin(Velocity.prototype, {
      init: function() {
        this.context = {};
        this.macros = {};
        this.defines = {};
        this.conditions = [];
        this.local = {};
        this.silence = false;
        this.unescape = {};
      },
  
      /**
       * @param context {object} 上下文环境，数据对象
       * @param macro   {object} self defined #macro
       * @param silent {bool} 如果是true，$foo变量将原样输出
       * @return str
       */
      render: function(context, macros, silence) {
  
        this.silence = !!silence;
        this.context = context || {};
        this.jsmacros = macros || {};
  
        if (!this.config.isAsync) {
          var t1 = utils.now();
          var str = this._render();
          var t2 = utils.now();
          var cost = t2 - t1;
  
          this.cost = cost;
  
          return str;
        }
  
        return this.asyncRender(this.asts);
      },
  
      /**
       * 解析入口函数
       * @param ast {array} 模板结构数组
       * @param contextId {number} 执行环境id，对于macro有局部作用域，变量的设置和
       * 取值，都放在一个this.local下，通过contextId查找
       * @return {string}解析后的字符串
       */
      _render: function(asts, contextId) {
  
        asts = asts || this.asts;
  
        if (contextId) {
  
          if (contextId !== this.condition &&
              utils.indexOf(contextId, this.conditions) === -1) {
            this.conditions.unshift(contextId);
          }
  
          this.condition = contextId;
  
        } else {
          this.condition = null;
        }
  
        return utils.map(asts, this.compute, this).join('');
      },
  
      asyncRender: function(asts) {
        return step(this.toPromises(asts));
      },
  
      compute: function(ast) {
        switch (ast.type) {
          case 'references':
            return this.getReferences(ast, true);
  
          case 'set':
            this.setValue(ast);
            return '';
  
          case 'break':
            this.setBreak = true;
            return '';
  
          case 'macro_call':
            return this.getMacro(ast);
  
          case 'comment':
            return '';
  
          default:
            return typeof ast === 'string' ? ast : this.getBlock(ast);
        }
      },
  
      toPromises: function(asts) {
        var self = this;
        return utils.map(asts, function(ast) {
          return function() {
            var ret = self.compute(ast);
            if (typeof ret === 'string') {
              return Promise.resolve(ret);
            }
  
            // 否则是promise对象
            return ret;
          };
        });
      }
    });
  }(Velocity, utils);
  
  /** file: ./src/compile/expression.js*/
  !function(Velocity, utils){
    /**
     * expression运算
     */
    utils.mixin(Velocity.prototype, {
      /**
       * 表达式求值，表达式主要是数学表达式，逻辑运算和比较运算，到最底层数据结构，
       * 基本数据类型，使用 getLiteral求值，getLiteral遇到是引用的时候，使用
       * getReferences求值
       */
      getExpression: function(ast){
  
        var exp = ast.expression;
        var ret;
        if (ast.type === 'math') {
  
          switch(ast.operator) {
            case '+':
            ret = this.getExpression(exp[0]) + this.getExpression(exp[1]);
            break;
  
            case '-':
            ret = this.getExpression(exp[0]) - this.getExpression(exp[1]);
            break;
  
            case '/':
            ret = this.getExpression(exp[0]) / this.getExpression(exp[1]);
            break;
  
            case '%':
            ret = this.getExpression(exp[0]) % this.getExpression(exp[1]);
            break;
  
            case '*':
            ret = this.getExpression(exp[0]) * this.getExpression(exp[1]);
            break;
  
            case '||':
            ret = this.getExpression(exp[0]) || this.getExpression(exp[1]);
            break;
  
            case '&&':
            ret = this.getExpression(exp[0]) && this.getExpression(exp[1]);
            break;
  
            case '>':
            ret = this.getExpression(exp[0]) > this.getExpression(exp[1]);
            break;
  
            case '<':
            ret = this.getExpression(exp[0]) < this.getExpression(exp[1]);
            break;
  
            case '==':
            ret = this.getExpression(exp[0]) == this.getExpression(exp[1]);
            break;
  
            case '>=':
            ret = this.getExpression(exp[0]) >= this.getExpression(exp[1]);
            break;
  
            case '<=':
            ret = this.getExpression(exp[0]) <= this.getExpression(exp[1]);
            break;
  
            case '!=':
            ret = this.getExpression(exp[0]) != this.getExpression(exp[1]);
            break;
  
            case 'minus':
            ret = - this.getExpression(exp[0]);
            break;
  
            case 'not':
            ret = !this.getExpression(exp[0]);
            break;
  
            case 'parenthesis':
            ret = this.getExpression(exp[0]);
            break;
  
            default:
            return;
            // code
          }
  
          return ret;
        } else {
          return this.getLiteral(ast);
        }
      }
    });
  }(Velocity, utils);
  
  /** file: ./src/compile/literal.js*/
  !function(Velocity, utils){
    /**
     * literal解释模块
     * @require {method} getReferences
     */
    utils.mixin(Velocity.prototype, {
      /**
       * 字面量求值，主要包括string, integer, array, map四种数据结构
       * @param literal {object} 定义于velocity.yy文件，type描述数据类型，value属性
       * 是literal值描述
       * @return {object|string|number|array}返回对应的js变量
       */
      getLiteral: function(literal){
  
        var type = literal.type;
        var ret = '';
  
        if (type == 'string') {
  
          ret = this.getString(literal);
  
        } else if (type == 'integer') {
  
          ret = parseInt(literal.value, 10);
  
        } else if (type == 'decimal') {
  
          ret = parseFloat(literal.value, 10);
  
        } else if (type == 'array') {
  
          ret = this.getArray(literal);
  
        } else if(type == 'map') {
  
          ret = {};
          var map = literal.value;
  
          utils.forEach(map, function(exp, key){
            ret[key] = this.getLiteral(exp);
          }, this);
        } else if(type == 'bool') {
  
          if (literal.value === "null") {
            ret = null;
          } else if (literal.value === 'false') {
            ret = false;
          } else if (literal.value === 'true') {
            ret = true;
          }
  
        } else {
  
          return this.getReferences(literal);
  
        }
  
        return ret;
      },
  
      /**
       * 对字符串求值，对已双引号字符串，需要做变量替换
       */
      getString: function(literal){
        var val = literal.value;
        var ret = val;
  
        if (literal.isEval && (val.indexOf('#') !== -1 || val.indexOf("$") !== -1)) {
          ret = this.evalStr(val);
        }
  
        return ret;
      },
  
      /**
       * 对array字面量求值，比如[1, 2]=> [1,2]，[1..5] => [1,2,3,4,5]
       * @param literal {object} array字面量的描述对象，分为普通数组和range数组两种
       * ，和js基本一致
       * @return {array} 求值得到的数组
       */
      getArray: function(literal){
  
        var ret = [];
  
        if (literal.isRange) {
  
          var begin = literal.value[0];
          if (begin.type === 'references') {
            begin = this.getReferences(begin);
          }
  
          var end = literal.value[1];
          if (end.type === 'references') {
            end = this.getReferences(end);
          }
  
          end   = parseInt(end, 10);
          begin = parseInt(begin, 10);
  
          var i;
  
          if (!isNaN(begin) && !isNaN(end)) {
  
            if (begin < end) {
              for (i = begin; i <= end; i++) ret.push(i);
            } else {
              for (i = begin; i >= end; i--) ret.push(i);
            }
          }
  
        } else {
          utils.forEach(literal.value, function(exp){
            ret.push(this.getLiteral(exp));
          }, this);
        }
  
        return ret;
      },
  
      /**
       * 对双引号字符串进行eval求值，替换其中的变量，只支持最基本的变量类型替换
       */
      evalStr: function(str){
        var asts = Velocity.Parser.parse(str);
        return this._render(asts);
      }
    });
  }(Velocity, utils);
  
  /** file: ./src/compile/references.js*/
  !function(Velocity, utils){
  
    'use strict';
  
    function getSize(obj){
  
      if (utils.isArray(obj)) {
        return obj.length;
      } else if (utils.isObject(obj)) {
        return utils.keys(obj).length;
      }
  
      return undefined;
    }
  
    /**
     * unicode转码
     */
    function convert(str){
  
      if (typeof str !== 'string') return str;
  
      var result = ""
      var escape = false
      var i, c, cstr;
  
      for(i = 0 ; i < str.length ; i++) {
        c = str.charAt(i);
        if((' ' <= c && c <= '~') || (c == '\r') || (c == '\n')) {
          if(c == '&') {
            cstr = "&amp;"
            escape = true
          } else if(c == '<') {
            cstr = "&lt;"
            escape = true
          } else if(c == '>') {
            cstr = "&gt;"
            escape = true
          } else {
            cstr = c.toString()
          }
        } else {
          cstr = "&#" + c.charCodeAt().toString() + ";"
        }
  
        result = result + cstr
      }
  
      return escape ? result : str
  
    }
    
  
    utils.mixin(Velocity.prototype, {
      
      //增加某些函数，不需要执行html转义
      addIgnoreEscpape: function(key){
  
        if (!utils.isArray(key)) key = [key]
  
        utils.forEach(key, function(key){
          this.config.unescape[key] = true
        }, this)
  
      },
  
      /**
       * 引用求值
       * @param {object} ast 结构来自velocity.yy
       * @param {bool} isVal 取值还是获取字符串，两者的区别在于，求值返回结果，求
       * 字符串，如果没有返回变量自身，比如$foo
       */
      getReferences: function(ast, isVal) {
  
        if (ast.prue) {
          var define = this.defines[ast.id];
          if (utils.isArray(define)) {
            return this._render(define);
          }
          if (ast.id in this.config.unescape) ast.prue = false;
        }
        var escape = this.config.escape;
  
        var isSilent = this.silence || ast.leader === "$!";
        var isfn     = ast.args !== undefined;
        var context  = this.context;
        var ret      = context[ast.id];
        var local    = this.getLocal(ast);
  
        var text = Velocity.Helper.getRefText(ast);
  
        if (text in context) {
          return (ast.prue && escape) ? convert(context[text]) : context[text];
        }
  
  
        if (ret !== undefined && isfn) {
          ret = this.getPropMethod(ast, context, ast);
        }
  
        if (local.isLocaled) ret = local['value'];
  
        if (ast.path && ret !== undefined) {
  
          utils.some(ast.path, function(property){
  
            //第三个参数，返回后面的参数ast
            ret = this.getAttributes(property, ret, ast);
  
          }, this);
        }
  
        if (isVal && ret === undefined) {
          ret = isSilent? '' : Velocity.Helper.getRefText(ast);
        }
  
        ret = (ast.prue && escape) ? convert(ret) : ret;
  
        return ret;
      },
  
      /**
       * 获取局部变量，在macro和foreach循环中使用
       */
      getLocal: function(ast){
  
        var id = ast.id;
        var local = this.local;
        var ret = false;
  
        var isLocaled = utils.some(this.conditions, function(contextId){
          var _local = local[contextId];
          if (id in _local) {
            ret = _local[id];
            return true;
          }
  
          return false;
        }, this);
  
        return {
          value: ret,
          isLocaled: isLocaled
        };
      },
      /**
       * $foo.bar 属性求值，最后面两个参数在用户传递的函数中用到
       * @param {object} property 属性描述，一个对象，主要包括id，type等定义
       * @param {object} baseRef 当前执行链结果，比如$a.b.c，第一次baseRef是$a,
       * 第二次是$a.b返回值
       * @private
       */
      getAttributes: function(property, baseRef, ast){
        /**
         * type对应着velocity.yy中的attribute，三种类型: method, index, property
         */
        var type = property.type;
        var ret;
        var id = property.id;
        if (type === 'method'){
          ret = this.getPropMethod(property, baseRef, ast);
        } else if (type === 'property') {
          ret = baseRef[id];
        } else {
          ret = this.getPropIndex(property, baseRef);
        }
        return ret;
      },
  
      /**
       * $foo.bar[1] index求值
       * @private
       */
      getPropIndex: function(property, baseRef){
        var ast = property.id;
        var key;
        if (ast.type === 'references'){
          key = this.getReferences(ast);
        } else if(ast.type === 'integer'){
          key = ast.value;
        } else {
          key = ast.value;
        }
  
        return baseRef[key];
      },
  
      /**
       * $foo.bar()求值
       */
      getPropMethod: function(property, baseRef, ast){
  
        var id         = property.id;
        var ret        = '';
        var _id        = id.slice(3);
  
        // getter 处理
        if (id.indexOf('get') === 0 && !(id in baseRef)) {
  
          if (_id) {
            ret = baseRef[_id];
          } else {
            //map 对应的get方法
            _id = this.getLiteral(property.args[0]);
            ret = baseRef[_id];
          }
  
          return ret;
  
        // setter 处理
        } else if (id.indexOf('set') === 0 && !baseRef[id]) {
  
          baseRef[_id] = this.getLiteral(property.args[0]);
          // $page.setName(123)
          baseRef.toString =  function() { return ''; };
          return baseRef;
  
        } else if (id.indexOf('is') === 0 && !(id in baseRef)) {
  
          _id = id.slice(2);
          ret = baseRef[_id];
          return ret;
  
        } else if (id === 'keySet') {
  
          return utils.keys(baseRef);
  
        } else if (id === 'entrySet') {
  
          ret = [];
          utils.forEach(baseRef, function(value, key){
            ret.push({key: key, value: value});
          });
  
          return ret;
  
        } else if (id === 'size') {
  
          return getSize(baseRef);
  
        } else {
  
          ret = baseRef[id];
          var args = [];
  
          utils.forEach(property.args, function(exp){
            args.push(this.getLiteral(exp));
          }, this);
  
          if (ret && ret.call) {
  
            var that = this;
  
            baseRef.eval = function() {
              return that.eval.apply(that, arguments);
            };
  
            try {
              ret = ret.apply(baseRef, args);
            } catch(e) {
              var pos = ast.pos;
              var text = Velocity.Helper.getRefText(ast);
              var err = ' on ' + text + ' at L/N ' + pos.first_line + ':' + pos.first_column;
              e.name = '';
              e.message += err;
              throw new Error(e);
            }
  
          } else {
            ret = undefined;
          }
        }
  
        return ret;
      }
    })
  
  }
  /** file: ./src/compile/set.js*/
  !function(Velocity, utils){
    /**
     * 变量设置
     */
    utils.mixin(Velocity.prototype, {
      /**
       * 获取执行环境，对于macro中定义的变量，为局部变量，不贮存在全局中，执行后销毁
       */
      getContext: function(){
        var condition = this.condition;
        var local = this.local;
        if (condition) {
          return local[condition];
        } else {
          return this.context;
        }
      },
      /**
       * parse #set
       */
      setValue: function(ast){
        var ref = ast.equal[0];
        var context  = this.getContext();
  
        //see https://github.com/shepherdwind/velocity.js/issues/25
        if (this.condition && this.condition.indexOf('macro:') === 0) {
          context = this.context;
        } else if (this.context[ref.id] != null) {
          context = this.context;
        }
  
        var valAst = ast.equal[1];
        var val;
  
        if (valAst.type === 'math') {
          val = this.getExpression(valAst);
        } else {
          val = this.getLiteral(ast.equal[1]);
        }
  
        if (!ref.path) {
  
          context[ref.id] = val;
  
        } else {
  
          var baseRef = context[ref.id];
          if (typeof baseRef != 'object') {
            baseRef = {};
          }
  
          context[ref.id] = baseRef;
          var len = ref.path ? ref.path.length: 0;
  
          //console.log(val);
          utils.forEach(ref.path, function(exp, i){
  
            var isEnd = len === i + 1;
            var key = exp.id;
            if (exp.type === 'index')  key = key.value;
            baseRef[key] = isEnd? val: {};
            baseRef = baseRef[key];
  
          });
  
        }
      }
    });
  }(Velocity, utils);
  
  
    module.exports = function(ast){
        return new Velocity(ast);
    }
});