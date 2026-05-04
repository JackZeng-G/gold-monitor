import { A as extend, B as isSymbol, C as watch, D as unref, E as ref, F as isModelListener, H as normalizeStyle, I as isObject, L as isOn, M as includeBooleanAttr, N as isArray, O as camelize, P as isFunction, R as isSpecialBooleanAttr, S as resolveDirective, T as withDirectives, U as toDisplayString, V as normalizeClass, W as toNumber, _ as onMounted, a as Fragment, b as renderList, c as createBaseVNode, d as createElementBlock, f as createRenderer, g as h, h as createVNode, i as BaseTransitionPropsValidators, j as hyphenate, k as capitalize, l as createBlock, m as createTextVNode, n as defineStore, o as callWithAsyncErrorHandling, p as createStaticVNode, r as BaseTransition, s as computed, t as createPinia, u as createCommentVNode, v as onUnmounted, w as withCtx, x as renderSlot, y as openBlock, z as isString } from "./vue-vendor-Cm6xcTrQ.js";
import { t as axios } from "./utils-BNV70U-t.js";
import { t as init } from "./charts-DcU-o_rA.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
/**
* @vue/runtime-dom v3.5.30
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var policy = void 0;
var tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) try {
	policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (val) => val });
} catch (e) {}
var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
var svgNS = "http://www.w3.org/2000/svg";
var mathmlNS = "http://www.w3.org/1998/Math/MathML";
var doc = typeof document !== "undefined" ? document : null;
var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
var nodeOps = {
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null);
	},
	remove: (child) => {
		const parent = child.parentNode;
		if (parent) parent.removeChild(child);
	},
	createElement: (tag, namespace, is, props) => {
		const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
		if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
		return el;
	},
	createText: (text) => doc.createTextNode(text),
	createComment: (text) => doc.createComment(text),
	setText: (node, text) => {
		node.nodeValue = text;
	},
	setElementText: (el, text) => {
		el.textContent = text;
	},
	parentNode: (node) => node.parentNode,
	nextSibling: (node) => node.nextSibling,
	querySelector: (selector) => doc.querySelector(selector),
	setScopeId(el, id) {
		el.setAttribute(id, "");
	},
	insertStaticContent(content, parent, anchor, namespace, start, end) {
		const before = anchor ? anchor.previousSibling : parent.lastChild;
		if (start && (start === end || start.nextSibling)) while (true) {
			parent.insertBefore(start.cloneNode(true), anchor);
			if (start === end || !(start = start.nextSibling)) break;
		}
		else {
			templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
			const template = templateContainer.content;
			if (namespace === "svg" || namespace === "mathml") {
				const wrapper = template.firstChild;
				while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
				template.removeChild(wrapper);
			}
			parent.insertBefore(template, anchor);
		}
		return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
	}
};
var TRANSITION = "transition";
var ANIMATION = "animation";
var vtcKey = /* @__PURE__ */ Symbol("_vtc");
var DOMTransitionPropsValidators = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: true
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
};
var TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
var decorate$1 = (t) => {
	t.displayName = "Transition";
	t.props = TransitionPropsValidators;
	return t;
};
var Transition = /* @__PURE__ */ decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
var callHook = (hook, args = []) => {
	if (isArray(hook)) hook.forEach((h2) => h2(...args));
	else if (hook) hook(...args);
};
var hasExplicitCallback = (hook) => {
	return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
	const baseProps = {};
	for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
	if (rawProps.css === false) return baseProps;
	const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
	const durations = normalizeDuration(duration);
	const enterDuration = durations && durations[0];
	const leaveDuration = durations && durations[1];
	const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
	const finishEnter = (el, isAppear, done, isCancelled) => {
		el._enterCancelled = isCancelled;
		removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
		removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
		done && done();
	};
	const finishLeave = (el, done) => {
		el._isLeaving = false;
		removeTransitionClass(el, leaveFromClass);
		removeTransitionClass(el, leaveToClass);
		removeTransitionClass(el, leaveActiveClass);
		done && done();
	};
	const makeEnterHook = (isAppear) => {
		return (el, done) => {
			const hook = isAppear ? onAppear : onEnter;
			const resolve = () => finishEnter(el, isAppear, done);
			callHook(hook, [el, resolve]);
			nextFrame(() => {
				removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
				addTransitionClass(el, isAppear ? appearToClass : enterToClass);
				if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
			});
		};
	};
	return extend(baseProps, {
		onBeforeEnter(el) {
			callHook(onBeforeEnter, [el]);
			addTransitionClass(el, enterFromClass);
			addTransitionClass(el, enterActiveClass);
		},
		onBeforeAppear(el) {
			callHook(onBeforeAppear, [el]);
			addTransitionClass(el, appearFromClass);
			addTransitionClass(el, appearActiveClass);
		},
		onEnter: makeEnterHook(false),
		onAppear: makeEnterHook(true),
		onLeave(el, done) {
			el._isLeaving = true;
			const resolve = () => finishLeave(el, done);
			addTransitionClass(el, leaveFromClass);
			if (!el._enterCancelled) {
				forceReflow(el);
				addTransitionClass(el, leaveActiveClass);
			} else {
				addTransitionClass(el, leaveActiveClass);
				forceReflow(el);
			}
			nextFrame(() => {
				if (!el._isLeaving) return;
				removeTransitionClass(el, leaveFromClass);
				addTransitionClass(el, leaveToClass);
				if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
			});
			callHook(onLeave, [el, resolve]);
		},
		onEnterCancelled(el) {
			finishEnter(el, false, void 0, true);
			callHook(onEnterCancelled, [el]);
		},
		onAppearCancelled(el) {
			finishEnter(el, true, void 0, true);
			callHook(onAppearCancelled, [el]);
		},
		onLeaveCancelled(el) {
			finishLeave(el);
			callHook(onLeaveCancelled, [el]);
		}
	});
}
function normalizeDuration(duration) {
	if (duration == null) return null;
	else if (isObject(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
	else {
		const n = NumberOf(duration);
		return [n, n];
	}
}
function NumberOf(val) {
	return toNumber(val);
}
function addTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
	(el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
	const _vtc = el[vtcKey];
	if (_vtc) {
		_vtc.delete(cls);
		if (!_vtc.size) el[vtcKey] = void 0;
	}
}
function nextFrame(cb) {
	requestAnimationFrame(() => {
		requestAnimationFrame(cb);
	});
}
var endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
	const id = el._endId = ++endId;
	const resolveIfNotStale = () => {
		if (id === el._endId) resolve();
	};
	if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
	const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
	if (!type) return resolve();
	const endEvent = type + "end";
	let ended = 0;
	const end = () => {
		el.removeEventListener(endEvent, onEnd);
		resolveIfNotStale();
	};
	const onEnd = (e) => {
		if (e.target === el && ++ended >= propCount) end();
	};
	setTimeout(() => {
		if (ended < propCount) end();
	}, timeout + 1);
	el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
	const styles = window.getComputedStyle(el);
	const getStyleProperties = (key) => (styles[key] || "").split(", ");
	const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
	const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
	const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
	const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
	const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
	const animationTimeout = getTimeout(animationDelays, animationDurations);
	let type = null;
	let timeout = 0;
	let propCount = 0;
	if (expectedType === TRANSITION) {
		if (transitionTimeout > 0) {
			type = TRANSITION;
			timeout = transitionTimeout;
			propCount = transitionDurations.length;
		}
	} else if (expectedType === ANIMATION) {
		if (animationTimeout > 0) {
			type = ANIMATION;
			timeout = animationTimeout;
			propCount = animationDurations.length;
		}
	} else {
		timeout = Math.max(transitionTimeout, animationTimeout);
		type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
		propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
	}
	const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
	return {
		type,
		timeout,
		propCount,
		hasTransform
	};
}
function getTimeout(delays, durations) {
	while (delays.length < durations.length) delays = delays.concat(delays);
	return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
	if (s === "auto") return 0;
	return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
	return (el ? el.ownerDocument : document).body.offsetHeight;
}
function patchClass(el, value, isSVG) {
	const transitionClasses = el[vtcKey];
	if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
	if (value == null) el.removeAttribute("class");
	else if (isSVG) el.setAttribute("class", value);
	else el.className = value;
}
var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
var CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
	const style = el.style;
	const isCssString = isString(next);
	let hasControlledDisplay = false;
	if (next && !isCssString) {
		if (prev) if (!isString(prev)) {
			for (const key in prev) if (next[key] == null) setStyle(style, key, "");
		} else for (const prevStyle of prev.split(";")) {
			const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
			if (next[key] == null) setStyle(style, key, "");
		}
		for (const key in next) {
			if (key === "display") hasControlledDisplay = true;
			setStyle(style, key, next[key]);
		}
	} else if (isCssString) {
		if (prev !== next) {
			const cssVarText = style[CSS_VAR_TEXT];
			if (cssVarText) next += ";" + cssVarText;
			style.cssText = next;
			hasControlledDisplay = displayRE.test(next);
		}
	} else if (prev) el.removeAttribute("style");
	if (vShowOriginalDisplay in el) {
		el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
		if (el[vShowHidden]) style.display = "none";
	}
}
var importantRE = /\s*!important$/;
function setStyle(style, name, val) {
	if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
	else {
		if (val == null) val = "";
		if (name.startsWith("--")) style.setProperty(name, val);
		else {
			const prefixed = autoPrefix(style, name);
			if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
			else style[prefixed] = val;
		}
	}
}
var prefixes = [
	"Webkit",
	"Moz",
	"ms"
];
var prefixCache = {};
function autoPrefix(style, rawName) {
	const cached = prefixCache[rawName];
	if (cached) return cached;
	let name = camelize(rawName);
	if (name !== "filter" && name in style) return prefixCache[rawName] = name;
	name = capitalize(name);
	for (let i = 0; i < prefixes.length; i++) {
		const prefixed = prefixes[i] + name;
		if (prefixed in style) return prefixCache[rawName] = prefixed;
	}
	return rawName;
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
	if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
	else el.setAttributeNS(xlinkNS, key, value);
	else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
	else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
	if (key === "innerHTML" || key === "textContent") {
		if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
		return;
	}
	const tag = el.tagName;
	if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
		const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
		const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
		if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
		if (value == null) el.removeAttribute(key);
		el._value = value;
		return;
	}
	let needRemove = false;
	if (value === "" || value == null) {
		const type = typeof el[key];
		if (type === "boolean") value = includeBooleanAttr(value);
		else if (value == null && type === "string") {
			value = "";
			needRemove = true;
		} else if (type === "number") {
			value = 0;
			needRemove = true;
		}
	}
	try {
		el[key] = value;
	} catch (e) {}
	needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
	el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
	el.removeEventListener(event, handler, options);
}
var veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
	const invokers = el[veiKey] || (el[veiKey] = {});
	const existingInvoker = invokers[rawName];
	if (nextValue && existingInvoker) existingInvoker.value = nextValue;
	else {
		const [name, options] = parseName(rawName);
		if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(nextValue, instance), options);
		else if (existingInvoker) {
			removeEventListener(el, name, existingInvoker, options);
			invokers[rawName] = void 0;
		}
	}
}
var optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
	let options;
	if (optionsModifierRE.test(name)) {
		options = {};
		let m;
		while (m = name.match(optionsModifierRE)) {
			name = name.slice(0, name.length - m[0].length);
			options[m[0].toLowerCase()] = true;
		}
	}
	return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
}
var cachedNow = 0;
var p = /* @__PURE__ */ Promise.resolve();
var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
	const invoker = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= invoker.attached) return;
		callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
	};
	invoker.value = initialValue;
	invoker.attached = getNow();
	return invoker;
}
function patchStopImmediatePropagation(e, value) {
	if (isArray(value)) {
		const originalStop = e.stopImmediatePropagation;
		e.stopImmediatePropagation = () => {
			originalStop.call(e);
			e._stopped = true;
		};
		return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
	} else return value;
}
var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
	const isSVG = namespace === "svg";
	if (key === "class") patchClass(el, nextValue, isSVG);
	else if (key === "style") patchStyle(el, prevValue, nextValue);
	else if (isOn(key)) {
		if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
	} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
		patchDOMProp(el, key, nextValue);
		if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
	} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
	else {
		if (key === "true-value") el._trueValue = nextValue;
		else if (key === "false-value") el._falseValue = nextValue;
		patchAttr(el, key, nextValue, isSVG);
	}
};
function shouldSetAsProp(el, key, value, isSVG) {
	if (isSVG) {
		if (key === "innerHTML" || key === "textContent") return true;
		if (key in el && isNativeOn(key) && isFunction(value)) return true;
		return false;
	}
	if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
	if (key === "sandbox" && el.tagName === "IFRAME") return false;
	if (key === "form") return false;
	if (key === "list" && el.tagName === "INPUT") return false;
	if (key === "type" && el.tagName === "TEXTAREA") return false;
	if (key === "width" || key === "height") {
		const tag = el.tagName;
		if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
	}
	if (isNativeOn(key) && isString(value)) return false;
	return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
	const props = el._def.props;
	if (!props) return false;
	const camelKey = camelize(key);
	return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
var systemModifiers = [
	"ctrl",
	"shift",
	"alt",
	"meta"
];
var modifierGuards = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
var withModifiers = (fn, modifiers) => {
	if (!fn) return fn;
	const cache = fn._withMods || (fn._withMods = {});
	const cacheKey = modifiers.join(".");
	return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
		for (let i = 0; i < modifiers.length; i++) {
			const guard = modifierGuards[modifiers[i]];
			if (guard && guard(event, modifiers)) return;
		}
		return fn(event, ...args);
	}));
};
var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
var renderer;
function ensureRenderer() {
	return renderer || (renderer = createRenderer(rendererOptions));
}
var createApp = ((...args) => {
	const app = ensureRenderer().createApp(...args);
	const { mount } = app;
	app.mount = (containerOrSelector) => {
		const container = normalizeContainer(containerOrSelector);
		if (!container) return;
		const component = app._component;
		if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
		if (container.nodeType === 1) container.textContent = "";
		const proxy = mount(container, false, resolveRootNamespace(container));
		if (container instanceof Element) {
			container.removeAttribute("v-cloak");
			container.setAttribute("data-v-app", "");
		}
		return proxy;
	};
	return app;
});
function resolveRootNamespace(container) {
	if (container instanceof SVGElement) return "svg";
	if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
}
function normalizeContainer(container) {
	if (isString(container)) return document.querySelector(container);
	return container;
}
//#endregion
//#region src/constants/index.js
/**
* 应用常量配置
*/
var API_BASE = window.location.origin;
var OZ_TO_GRAM = 31.1035;
var DATA_SOURCE_NAMES = {
	sina: "新浪财经",
	eastmoney: "东方财富",
	gate: "Gate.io",
	mixed: "混合数据源"
};
var REFRESH_INTERVALS = {
	active: 5e3,
	normal: 1e4,
	calm: 2e4,
	inactive: 3e4
};
var TOAST_AUTO_DISMISS = 5e3;
//#endregion
//#region src/utils/request.js
/**
* 统一请求封装工具
* 提供重试机制、错误处理、请求拦截等功能
*/
var CONFIG = {
	baseURL: API_BASE + "/api",
	timeout: 1e4,
	maxRetries: 3,
	retryDelay: 1e3,
	retryMultiplier: 2,
	maxRetryDelay: 5e3
};
var requestQueue = /* @__PURE__ */ new Map();
var api = axios.create({
	baseURL: CONFIG.baseURL,
	timeout: CONFIG.timeout,
	headers: { "Content-Type": "application/json" }
});
var APIError = class extends Error {
	constructor(message, code, response) {
		super(message);
		this.name = "APIError";
		this.code = code;
		this.response = response;
		this.timestamp = Date.now();
	}
	toString() {
		return `[APIError ${this.code}] ${this.message}`;
	}
};
var NetworkError = class extends Error {
	constructor(message, originalError) {
		super(message);
		this.name = "NetworkError";
		this.originalError = originalError;
	}
};
api.interceptors.request.use((config) => {
	config.metadata = { startTime: Date.now() };
	const requestKey = `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;
	if (requestQueue.has(requestKey)) return Promise.reject(new APIError("Duplicate request", "DUPLICATE_REQUEST"));
	requestQueue.set(requestKey, true);
	config.requestKey = requestKey;
	return config;
}, (error) => {
	console.error("[Request] Interceptor error:", error);
	return Promise.reject(error);
});
api.interceptors.response.use((response) => {
	const { config, data } = response;
	Date.now() - (config.metadata?.startTime || Date.now());
	if (config.requestKey) requestQueue.delete(config.requestKey);
	if (data.success === false) throw new APIError(data.error || "Request failed", data.code || "UNKNOWN_ERROR", response);
	return data.data !== void 0 ? data.data : data;
}, (error) => {
	const { config } = error;
	if (config?.requestKey) requestQueue.delete(config.requestKey);
	if (axios.isCancel(error)) return Promise.reject(new APIError("Request cancelled", "CANCELLED"));
	if (!error.response) {
		console.error("[Request] Network error:", error.message);
		return Promise.reject(new NetworkError("Network error", error));
	}
	const { status, data } = error.response;
	let message = "Request failed";
	let code = "HTTP_ERROR";
	switch (status) {
		case 400:
			message = data?.error || "Bad request";
			code = "BAD_REQUEST";
			break;
		case 401:
			message = "Unauthorized";
			code = "UNAUTHORIZED";
			break;
		case 403:
			message = "Forbidden";
			code = "FORBIDDEN";
			break;
		case 404:
			message = "Resource not found";
			code = "NOT_FOUND";
			break;
		case 429:
			message = "Too many requests";
			code = "RATE_LIMITED";
			break;
		case 500:
			message = "Server error";
			code = "SERVER_ERROR";
			break;
		case 502:
		case 503:
		case 504:
			message = "Service unavailable";
			code = "SERVICE_UNAVAILABLE";
			break;
		default: message = `HTTP ${status}`;
	}
	console.error(`[Request] HTTP ${status} ${config?.url}:`, message);
	return Promise.reject(new APIError(message, code, error.response));
});
/**
* 带重试机制的请求
* @param {Function} requestFn - 请求函数
* @param {Object} options - 重试选项
* @returns {Promise} 请求结果
*/
async function requestWithRetry(requestFn, options = {}) {
	const { maxRetries = CONFIG.maxRetries, retryDelay = CONFIG.retryDelay, retryMultiplier = CONFIG.retryMultiplier, maxRetryDelay = CONFIG.maxRetryDelay, shouldRetry = defaultShouldRetry } = options;
	let lastError;
	for (let attempt = 0; attempt <= maxRetries; attempt++) try {
		return await requestFn();
	} catch (error) {
		lastError = error;
		if (attempt === maxRetries || !shouldRetry(error)) break;
		const delay = Math.min(retryDelay * Math.pow(retryMultiplier, attempt), maxRetryDelay);
		console.warn(`[Request] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms:`, error.message);
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
	throw lastError;
}
/**
* 默认重试条件
* @param {Error} error - 错误对象
* @returns {boolean} 是否应该重试
*/
function defaultShouldRetry(error) {
	if (error instanceof NetworkError) return true;
	if (error instanceof APIError) return [
		"SERVER_ERROR",
		"SERVICE_UNAVAILABLE",
		"RATE_LIMITED"
	].includes(error.code);
	return false;
}
/**
* GET 请求
* @param {string} url - 请求地址
* @param {Object} params - 查询参数
* @param {Object} options - 请求选项
* @returns {Promise} 请求结果
*/
function get(url, params = {}, options = {}) {
	return requestWithRetry(() => api.get(url, {
		params,
		...options
	}), options);
}
/**
* POST 请求
* @param {string} url - 请求地址
* @param {Object} data - 请求数据
* @param {Object} options - 请求选项
* @returns {Promise} 请求结果
*/
function post(url, data = {}, options = {}) {
	return requestWithRetry(() => api.post(url, data, options), options);
}
/**
* PUT 请求
* @param {string} url - 请求地址
* @param {Object} data - 请求数据
* @param {Object} options - 请求选项
* @returns {Promise} 请求结果
*/
function put(url, data = {}, options = {}) {
	return requestWithRetry(() => api.put(url, data, options), options);
}
/**
* DELETE 请求
* @param {string} url - 请求地址
* @param {Object} params - 查询参数
* @param {Object} options - 请求选项
* @returns {Promise} 请求结果
*/
function del(url, params = {}, options = {}) {
	return requestWithRetry(() => api.delete(url, {
		params,
		...options
	}), options);
}
/**
* 取消所有进行中的请求
*/
function cancelAllRequests() {
	requestQueue.clear();
}
/**
* 获取请求统计信息
*/
function getRequestStats() {
	return {
		activeRequests: requestQueue.size,
		config: CONFIG
	};
}
var request_default = {
	get,
	post,
	put,
	delete: del,
	cancelAllRequests,
	getRequestStats,
	APIError,
	NetworkError
};
//#endregion
//#region src/services/api.js
var ENDPOINTS = {
	allPrices: "/gold/prices",
	source: "/gold/source"
};
/**
* 获取所有黄金价格数据
*/
async function fetchAllPrices(options = {}) {
	return request_default.get(ENDPOINTS.allPrices, {}, options);
}
/**
* 设置数据源
*/
async function setDataSource(source) {
	return request_default.post(ENDPOINTS.source, { source });
}
/**
* 获取K线数据
*/
async function fetchKlineData(symbol, period = "day") {
	return request_default.get(`/kline/symbol/${symbol}`, { period });
}
/**
* 获取黄金资讯
*/
async function fetchNews() {
	return request_default.get("/news");
}
//#endregion
//#region src/services/websocket.js
var WS_URL = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws`;
var RECONNECT_CONFIG = {
	initialDelay: 1e3,
	maxDelay: 3e4,
	multiplier: 2,
	jitter: .2,
	maxAttempts: Infinity,
	resetTime: 6e4
};
var HEARTBEAT_CONFIG = {
	interval: 25e3,
	timeout: 15e3,
	maxMissed: 3
};
var WebSocketService = class {
	constructor() {
		this.ws = null;
		this.handlers = /* @__PURE__ */ new Map();
		this.reconnectAttempts = 0;
		this.reconnectTimer = null;
		this.heartbeatTimer = null;
		this.heartbeatTimeout = null;
		this.missedHeartbeats = 0;
		this.statusCallback = null;
		this.isManualClose = false;
		this.lastConnectedTime = 0;
		this.networkUnsubscribe = null;
		this.connectionState = "disconnected";
	}
	calculateReconnectDelay() {
		const delay = Math.min(RECONNECT_CONFIG.initialDelay * Math.pow(RECONNECT_CONFIG.multiplier, this.reconnectAttempts), RECONNECT_CONFIG.maxDelay);
		const jitterRange = delay * RECONNECT_CONFIG.jitter;
		const jitter = (Math.random() - .5) * 2 * jitterRange;
		return Math.max(delay + jitter, RECONNECT_CONFIG.initialDelay);
	}
	async connect() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) return true;
		if (this.connectionState === "connecting") return false;
		this.connectionState = "connecting";
		this.isManualClose = false;
		this.notifyStatus({
			connected: false,
			connecting: true,
			reconnecting: this.reconnectAttempts > 0,
			attempts: this.reconnectAttempts,
			state: this.connectionState
		});
		try {
			this.ws = new WebSocket(WS_URL);
			return new Promise((resolve) => {
				const connectionTimeout = setTimeout(() => {
					console.warn("[WS] Connection timeout");
					if (this.ws) this.ws.close();
					this.connectionState = "disconnected";
					resolve(false);
				}, 1e4);
				this.ws.onopen = () => {
					clearTimeout(connectionTimeout);
					this.connectionState = "connected";
					this.lastConnectedTime = Date.now();
					this.reconnectAttempts = 0;
					this.missedHeartbeats = 0;
					this.notifyStatus({
						connected: true,
						connecting: false,
						reconnecting: false,
						attempts: 0,
						state: "connected"
					});
					this.startHeartbeat();
					resolve(true);
				};
				this.ws.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data);
						this.handleMessage(message);
						this.missedHeartbeats = 0;
						this.resetHeartbeatTimeout();
					} catch (e) {
						console.warn("[WS] Failed to parse message:", e);
					}
				};
				this.ws.onerror = (error) => {
					console.error("[WS] Error:", error);
					clearTimeout(connectionTimeout);
				};
				this.ws.onclose = (event) => {
					clearTimeout(connectionTimeout);
					this.connectionState = "disconnected";
					this.stopHeartbeat();
					this.notifyStatus({
						connected: false,
						connecting: false,
						reconnecting: false,
						attempts: this.reconnectAttempts,
						state: "disconnected"
					});
					if (!this.isManualClose) this.scheduleReconnect();
					resolve(false);
				};
			});
		} catch (error) {
			console.error("[WS] Failed to connect:", error);
			this.connectionState = "disconnected";
			return false;
		}
	}
	disconnect() {
		this.isManualClose = true;
		this.connectionState = "disconnected";
		this.stopHeartbeat();
		this.clearReconnectTimer();
		this.cleanupNetworkListener();
		if (this.ws) {
			this.ws.close(1e3, "Client disconnect");
			this.ws = null;
		}
		this.reconnectAttempts = 0;
		this.notifyStatus({
			connected: false,
			connecting: false,
			reconnecting: false,
			attempts: 0,
			state: "disconnected"
		});
	}
	scheduleReconnect() {
		if (this.reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
			console.error("[WS] Max reconnect attempts reached, giving up");
			this.notifyStatus({
				connected: false,
				connecting: false,
				reconnecting: false,
				attempts: this.reconnectAttempts,
				state: "failed",
				error: "max_attempts_reached"
			});
			return;
		}
		this.reconnectAttempts++;
		const delay = this.calculateReconnectDelay();
		(delay / 1e3).toFixed(1);
		this.connectionState = "reconnecting";
		this.notifyStatus({
			connected: false,
			connecting: false,
			reconnecting: true,
			attempts: this.reconnectAttempts,
			nextRetryIn: delay,
			state: "reconnecting"
		});
		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}
	clearReconnectTimer() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}
	reconnectNow() {
		this.clearReconnectTimer();
		this.reconnectAttempts = Math.max(0, this.reconnectAttempts - 1);
		this.connect();
	}
	startHeartbeat() {
		this.stopHeartbeat();
		this.heartbeatTimer = setInterval(() => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) try {
				this.ws.send(JSON.stringify({ type: "ping" }));
				this.resetHeartbeatTimeout();
			} catch (e) {
				console.warn("[WS] Failed to send ping:", e);
			}
		}, HEARTBEAT_CONFIG.interval);
	}
	resetHeartbeatTimeout() {
		if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
		this.heartbeatTimeout = setTimeout(() => {
			this.missedHeartbeats++;
			if (this.missedHeartbeats > 1) console.warn(`[WS] Heartbeat timeout (missed: ${this.missedHeartbeats}/${HEARTBEAT_CONFIG.maxMissed})`);
			if (this.missedHeartbeats >= HEARTBEAT_CONFIG.maxMissed) {
				console.error("[WS] Too many missed heartbeats, closing connection");
				if (this.ws) this.ws.close(1e3, "heartbeat_timeout");
			}
		}, HEARTBEAT_CONFIG.timeout);
	}
	stopHeartbeat() {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
		if (this.heartbeatTimeout) {
			clearTimeout(this.heartbeatTimeout);
			this.heartbeatTimeout = null;
		}
		this.missedHeartbeats = 0;
	}
	cleanupNetworkListener() {
		if (this.networkUnsubscribe) {
			this.networkUnsubscribe();
			this.networkUnsubscribe = null;
		}
	}
	on(type, handler) {
		if (!this.handlers.has(type)) this.handlers.set(type, /* @__PURE__ */ new Set());
		this.handlers.get(type).add(handler);
	}
	off(type, handler) {
		const handlers = this.handlers.get(type);
		if (handlers) handlers.delete(handler);
	}
	onStatusChange(callback) {
		this.statusCallback = callback;
	}
	isConnected() {
		return this.ws && this.ws.readyState === WebSocket.OPEN;
	}
	handleMessage(message) {
		const handlers = this.handlers.get(message.type);
		if (handlers) handlers.forEach((handler) => handler(message.data));
		const allHandlers = this.handlers.get("*");
		if (allHandlers) allHandlers.forEach((handler) => handler(message));
	}
	notifyStatus(status) {
		if (this.statusCallback) this.statusCallback(status);
	}
};
var wsService = new WebSocketService();
//#endregion
//#region node_modules/pako/dist/pako.esm.mjs
/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
var Z_FIXED$1 = 4;
var Z_BINARY = 0;
var Z_TEXT = 1;
var Z_UNKNOWN$1 = 2;
function zero$1(buf) {
	let len = buf.length;
	while (--len >= 0) buf[len] = 0;
}
var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES = 2;
var MIN_MATCH$1 = 3;
var MAX_MATCH$1 = 258;
var LENGTH_CODES$1 = 29;
var LITERALS$1 = 256;
var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
var D_CODES$1 = 30;
var BL_CODES$1 = 19;
var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
var MAX_BITS$1 = 15;
var Buf_size = 16;
var MAX_BL_BITS = 7;
var END_BLOCK = 256;
var REP_3_6 = 16;
var REPZ_3_10 = 17;
var REPZ_11_138 = 18;
var extra_lbits = new Uint8Array([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0
]);
var extra_dbits = new Uint8Array([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13
]);
var extra_blbits = new Uint8Array([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	2,
	3,
	7
]);
var bl_order = new Uint8Array([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]);
var DIST_CODE_LEN = 512;
var static_ltree = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
var static_dtree = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
var _dist_code = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
var _length_code = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
var base_length = new Array(LENGTH_CODES$1);
zero$1(base_length);
var base_dist = new Array(D_CODES$1);
zero$1(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
	this.static_tree = static_tree;
	this.extra_bits = extra_bits;
	this.extra_base = extra_base;
	this.elems = elems;
	this.max_length = max_length;
	this.has_stree = static_tree && static_tree.length;
}
var static_l_desc;
var static_d_desc;
var static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
	this.dyn_tree = dyn_tree;
	this.max_code = 0;
	this.stat_desc = stat_desc;
}
var d_code = (dist) => {
	return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
var put_short = (s, w) => {
	s.pending_buf[s.pending++] = w & 255;
	s.pending_buf[s.pending++] = w >>> 8 & 255;
};
var send_bits = (s, value, length) => {
	if (s.bi_valid > Buf_size - length) {
		s.bi_buf |= value << s.bi_valid & 65535;
		put_short(s, s.bi_buf);
		s.bi_buf = value >> Buf_size - s.bi_valid;
		s.bi_valid += length - Buf_size;
	} else {
		s.bi_buf |= value << s.bi_valid & 65535;
		s.bi_valid += length;
	}
};
var send_code = (s, c, tree) => {
	send_bits(s, tree[c * 2], tree[c * 2 + 1]);
};
var bi_reverse = (code, len) => {
	let res = 0;
	do {
		res |= code & 1;
		code >>>= 1;
		res <<= 1;
	} while (--len > 0);
	return res >>> 1;
};
var bi_flush = (s) => {
	if (s.bi_valid === 16) {
		put_short(s, s.bi_buf);
		s.bi_buf = 0;
		s.bi_valid = 0;
	} else if (s.bi_valid >= 8) {
		s.pending_buf[s.pending++] = s.bi_buf & 255;
		s.bi_buf >>= 8;
		s.bi_valid -= 8;
	}
};
var gen_bitlen = (s, desc) => {
	const tree = desc.dyn_tree;
	const max_code = desc.max_code;
	const stree = desc.stat_desc.static_tree;
	const has_stree = desc.stat_desc.has_stree;
	const extra = desc.stat_desc.extra_bits;
	const base = desc.stat_desc.extra_base;
	const max_length = desc.stat_desc.max_length;
	let h;
	let n, m;
	let bits;
	let xbits;
	let f;
	let overflow = 0;
	for (bits = 0; bits <= MAX_BITS$1; bits++) s.bl_count[bits] = 0;
	tree[s.heap[s.heap_max] * 2 + 1] = 0;
	for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
		n = s.heap[h];
		bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
		if (bits > max_length) {
			bits = max_length;
			overflow++;
		}
		tree[n * 2 + 1] = bits;
		if (n > max_code) continue;
		s.bl_count[bits]++;
		xbits = 0;
		if (n >= base) xbits = extra[n - base];
		f = tree[n * 2];
		s.opt_len += f * (bits + xbits);
		if (has_stree) s.static_len += f * (stree[n * 2 + 1] + xbits);
	}
	if (overflow === 0) return;
	do {
		bits = max_length - 1;
		while (s.bl_count[bits] === 0) bits--;
		s.bl_count[bits]--;
		s.bl_count[bits + 1] += 2;
		s.bl_count[max_length]--;
		overflow -= 2;
	} while (overflow > 0);
	for (bits = max_length; bits !== 0; bits--) {
		n = s.bl_count[bits];
		while (n !== 0) {
			m = s.heap[--h];
			if (m > max_code) continue;
			if (tree[m * 2 + 1] !== bits) {
				s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
				tree[m * 2 + 1] = bits;
			}
			n--;
		}
	}
};
var gen_codes = (tree, max_code, bl_count) => {
	const next_code = new Array(MAX_BITS$1 + 1);
	let code = 0;
	let bits;
	let n;
	for (bits = 1; bits <= MAX_BITS$1; bits++) {
		code = code + bl_count[bits - 1] << 1;
		next_code[bits] = code;
	}
	for (n = 0; n <= max_code; n++) {
		let len = tree[n * 2 + 1];
		if (len === 0) continue;
		tree[n * 2] = bi_reverse(next_code[len]++, len);
	}
};
var tr_static_init = () => {
	let n;
	let bits;
	let length;
	let code;
	let dist;
	const bl_count = new Array(MAX_BITS$1 + 1);
	length = 0;
	for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
		base_length[code] = length;
		for (n = 0; n < 1 << extra_lbits[code]; n++) _length_code[length++] = code;
	}
	_length_code[length - 1] = code;
	dist = 0;
	for (code = 0; code < 16; code++) {
		base_dist[code] = dist;
		for (n = 0; n < 1 << extra_dbits[code]; n++) _dist_code[dist++] = code;
	}
	dist >>= 7;
	for (; code < D_CODES$1; code++) {
		base_dist[code] = dist << 7;
		for (n = 0; n < 1 << extra_dbits[code] - 7; n++) _dist_code[256 + dist++] = code;
	}
	for (bits = 0; bits <= MAX_BITS$1; bits++) bl_count[bits] = 0;
	n = 0;
	while (n <= 143) {
		static_ltree[n * 2 + 1] = 8;
		n++;
		bl_count[8]++;
	}
	while (n <= 255) {
		static_ltree[n * 2 + 1] = 9;
		n++;
		bl_count[9]++;
	}
	while (n <= 279) {
		static_ltree[n * 2 + 1] = 7;
		n++;
		bl_count[7]++;
	}
	while (n <= 287) {
		static_ltree[n * 2 + 1] = 8;
		n++;
		bl_count[8]++;
	}
	gen_codes(static_ltree, L_CODES$1 + 1, bl_count);
	for (n = 0; n < D_CODES$1; n++) {
		static_dtree[n * 2 + 1] = 5;
		static_dtree[n * 2] = bi_reverse(n, 5);
	}
	static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
	static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
	static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
};
var init_block = (s) => {
	let n;
	for (n = 0; n < L_CODES$1; n++) s.dyn_ltree[n * 2] = 0;
	for (n = 0; n < D_CODES$1; n++) s.dyn_dtree[n * 2] = 0;
	for (n = 0; n < BL_CODES$1; n++) s.bl_tree[n * 2] = 0;
	s.dyn_ltree[END_BLOCK * 2] = 1;
	s.opt_len = s.static_len = 0;
	s.sym_next = s.matches = 0;
};
var bi_windup = (s) => {
	if (s.bi_valid > 8) put_short(s, s.bi_buf);
	else if (s.bi_valid > 0) s.pending_buf[s.pending++] = s.bi_buf;
	s.bi_buf = 0;
	s.bi_valid = 0;
};
var smaller = (tree, n, m, depth) => {
	const _n2 = n * 2;
	const _m2 = m * 2;
	return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
};
var pqdownheap = (s, tree, k) => {
	const v = s.heap[k];
	let j = k << 1;
	while (j <= s.heap_len) {
		if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) j++;
		if (smaller(tree, v, s.heap[j], s.depth)) break;
		s.heap[k] = s.heap[j];
		k = j;
		j <<= 1;
	}
	s.heap[k] = v;
};
var compress_block = (s, ltree, dtree) => {
	let dist;
	let lc;
	let sx = 0;
	let code;
	let extra;
	if (s.sym_next !== 0) do {
		dist = s.pending_buf[s.sym_buf + sx++] & 255;
		dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
		lc = s.pending_buf[s.sym_buf + sx++];
		if (dist === 0) send_code(s, lc, ltree);
		else {
			code = _length_code[lc];
			send_code(s, code + LITERALS$1 + 1, ltree);
			extra = extra_lbits[code];
			if (extra !== 0) {
				lc -= base_length[code];
				send_bits(s, lc, extra);
			}
			dist--;
			code = d_code(dist);
			send_code(s, code, dtree);
			extra = extra_dbits[code];
			if (extra !== 0) {
				dist -= base_dist[code];
				send_bits(s, dist, extra);
			}
		}
	} while (sx < s.sym_next);
	send_code(s, END_BLOCK, ltree);
};
var build_tree = (s, desc) => {
	const tree = desc.dyn_tree;
	const stree = desc.stat_desc.static_tree;
	const has_stree = desc.stat_desc.has_stree;
	const elems = desc.stat_desc.elems;
	let n, m;
	let max_code = -1;
	let node;
	s.heap_len = 0;
	s.heap_max = HEAP_SIZE$1;
	for (n = 0; n < elems; n++) if (tree[n * 2] !== 0) {
		s.heap[++s.heap_len] = max_code = n;
		s.depth[n] = 0;
	} else tree[n * 2 + 1] = 0;
	while (s.heap_len < 2) {
		node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
		tree[node * 2] = 1;
		s.depth[node] = 0;
		s.opt_len--;
		if (has_stree) s.static_len -= stree[node * 2 + 1];
	}
	desc.max_code = max_code;
	for (n = s.heap_len >> 1; n >= 1; n--) pqdownheap(s, tree, n);
	node = elems;
	do {
		/*** pqremove ***/
		n = s.heap[1];
		s.heap[1] = s.heap[s.heap_len--];
		pqdownheap(s, tree, 1);
		m = s.heap[1];
		s.heap[--s.heap_max] = n;
		s.heap[--s.heap_max] = m;
		tree[node * 2] = tree[n * 2] + tree[m * 2];
		s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
		tree[n * 2 + 1] = tree[m * 2 + 1] = node;
		s.heap[1] = node++;
		pqdownheap(s, tree, 1);
	} while (s.heap_len >= 2);
	s.heap[--s.heap_max] = s.heap[1];
	gen_bitlen(s, desc);
	gen_codes(tree, max_code, s.bl_count);
};
var scan_tree = (s, tree, max_code) => {
	let n;
	let prevlen = -1;
	let curlen;
	let nextlen = tree[1];
	let count = 0;
	let max_count = 7;
	let min_count = 4;
	if (nextlen === 0) {
		max_count = 138;
		min_count = 3;
	}
	tree[(max_code + 1) * 2 + 1] = 65535;
	for (n = 0; n <= max_code; n++) {
		curlen = nextlen;
		nextlen = tree[(n + 1) * 2 + 1];
		if (++count < max_count && curlen === nextlen) continue;
		else if (count < min_count) s.bl_tree[curlen * 2] += count;
		else if (curlen !== 0) {
			if (curlen !== prevlen) s.bl_tree[curlen * 2]++;
			s.bl_tree[REP_3_6 * 2]++;
		} else if (count <= 10) s.bl_tree[REPZ_3_10 * 2]++;
		else s.bl_tree[REPZ_11_138 * 2]++;
		count = 0;
		prevlen = curlen;
		if (nextlen === 0) {
			max_count = 138;
			min_count = 3;
		} else if (curlen === nextlen) {
			max_count = 6;
			min_count = 3;
		} else {
			max_count = 7;
			min_count = 4;
		}
	}
};
var send_tree = (s, tree, max_code) => {
	let n;
	let prevlen = -1;
	let curlen;
	let nextlen = tree[1];
	let count = 0;
	let max_count = 7;
	let min_count = 4;
	if (nextlen === 0) {
		max_count = 138;
		min_count = 3;
	}
	for (n = 0; n <= max_code; n++) {
		curlen = nextlen;
		nextlen = tree[(n + 1) * 2 + 1];
		if (++count < max_count && curlen === nextlen) continue;
		else if (count < min_count) do
			send_code(s, curlen, s.bl_tree);
		while (--count !== 0);
		else if (curlen !== 0) {
			if (curlen !== prevlen) {
				send_code(s, curlen, s.bl_tree);
				count--;
			}
			send_code(s, REP_3_6, s.bl_tree);
			send_bits(s, count - 3, 2);
		} else if (count <= 10) {
			send_code(s, REPZ_3_10, s.bl_tree);
			send_bits(s, count - 3, 3);
		} else {
			send_code(s, REPZ_11_138, s.bl_tree);
			send_bits(s, count - 11, 7);
		}
		count = 0;
		prevlen = curlen;
		if (nextlen === 0) {
			max_count = 138;
			min_count = 3;
		} else if (curlen === nextlen) {
			max_count = 6;
			min_count = 3;
		} else {
			max_count = 7;
			min_count = 4;
		}
	}
};
var build_bl_tree = (s) => {
	let max_blindex;
	scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
	scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
	build_tree(s, s.bl_desc);
	for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) break;
	s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
	return max_blindex;
};
var send_all_trees = (s, lcodes, dcodes, blcodes) => {
	let rank;
	send_bits(s, lcodes - 257, 5);
	send_bits(s, dcodes - 1, 5);
	send_bits(s, blcodes - 4, 4);
	for (rank = 0; rank < blcodes; rank++) send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
	send_tree(s, s.dyn_ltree, lcodes - 1);
	send_tree(s, s.dyn_dtree, dcodes - 1);
};
var detect_data_type = (s) => {
	let block_mask = 4093624447;
	let n;
	for (n = 0; n <= 31; n++, block_mask >>>= 1) if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) return Z_BINARY;
	if (s.dyn_ltree[18] !== 0 || s.dyn_ltree[20] !== 0 || s.dyn_ltree[26] !== 0) return Z_TEXT;
	for (n = 32; n < LITERALS$1; n++) if (s.dyn_ltree[n * 2] !== 0) return Z_TEXT;
	return Z_BINARY;
};
var static_init_done = false;
var _tr_init$1 = (s) => {
	if (!static_init_done) {
		tr_static_init();
		static_init_done = true;
	}
	s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
	s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
	s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
	s.bi_buf = 0;
	s.bi_valid = 0;
	init_block(s);
};
var _tr_stored_block$1 = (s, buf, stored_len, last) => {
	send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
	bi_windup(s);
	put_short(s, stored_len);
	put_short(s, ~stored_len);
	if (stored_len) s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
	s.pending += stored_len;
};
var _tr_align$1 = (s) => {
	send_bits(s, STATIC_TREES << 1, 3);
	send_code(s, END_BLOCK, static_ltree);
	bi_flush(s);
};
var _tr_flush_block$1 = (s, buf, stored_len, last) => {
	let opt_lenb, static_lenb;
	let max_blindex = 0;
	if (s.level > 0) {
		if (s.strm.data_type === Z_UNKNOWN$1) s.strm.data_type = detect_data_type(s);
		build_tree(s, s.l_desc);
		build_tree(s, s.d_desc);
		max_blindex = build_bl_tree(s);
		opt_lenb = s.opt_len + 3 + 7 >>> 3;
		static_lenb = s.static_len + 3 + 7 >>> 3;
		if (static_lenb <= opt_lenb) opt_lenb = static_lenb;
	} else opt_lenb = static_lenb = stored_len + 5;
	if (stored_len + 4 <= opt_lenb && buf !== -1) _tr_stored_block$1(s, buf, stored_len, last);
	else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
		send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
		compress_block(s, static_ltree, static_dtree);
	} else {
		send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
		send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
		compress_block(s, s.dyn_ltree, s.dyn_dtree);
	}
	init_block(s);
	if (last) bi_windup(s);
};
var _tr_tally$1 = (s, dist, lc) => {
	s.pending_buf[s.sym_buf + s.sym_next++] = dist;
	s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
	s.pending_buf[s.sym_buf + s.sym_next++] = lc;
	if (dist === 0) s.dyn_ltree[lc * 2]++;
	else {
		s.matches++;
		dist--;
		s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
		s.dyn_dtree[d_code(dist) * 2]++;
	}
	return s.sym_next === s.sym_end;
};
var trees = {
	_tr_init: _tr_init$1,
	_tr_stored_block: _tr_stored_block$1,
	_tr_flush_block: _tr_flush_block$1,
	_tr_tally: _tr_tally$1,
	_tr_align: _tr_align$1
};
var adler32 = (adler, buf, len, pos) => {
	let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
	while (len !== 0) {
		n = len > 2e3 ? 2e3 : len;
		len -= n;
		do {
			s1 = s1 + buf[pos++] | 0;
			s2 = s2 + s1 | 0;
		} while (--n);
		s1 %= 65521;
		s2 %= 65521;
	}
	return s1 | s2 << 16 | 0;
};
var adler32_1 = adler32;
var makeTable = () => {
	let c, table = [];
	for (var n = 0; n < 256; n++) {
		c = n;
		for (var k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c;
	}
	return table;
};
var crcTable = new Uint32Array(makeTable());
var crc32 = (crc, buf, len, pos) => {
	const t = crcTable;
	const end = pos + len;
	crc ^= -1;
	for (let i = pos; i < end; i++) crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
	return crc ^ -1;
};
var crc32_1 = crc32;
var messages = {
	2: "need dictionary",
	1: "stream end",
	0: "",
	"-1": "file error",
	"-2": "stream error",
	"-3": "data error",
	"-4": "insufficient memory",
	"-5": "buffer error",
	"-6": "incompatible version"
};
var constants$2 = {
	Z_NO_FLUSH: 0,
	Z_PARTIAL_FLUSH: 1,
	Z_SYNC_FLUSH: 2,
	Z_FULL_FLUSH: 3,
	Z_FINISH: 4,
	Z_BLOCK: 5,
	Z_TREES: 6,
	Z_OK: 0,
	Z_STREAM_END: 1,
	Z_NEED_DICT: 2,
	Z_ERRNO: -1,
	Z_STREAM_ERROR: -2,
	Z_DATA_ERROR: -3,
	Z_MEM_ERROR: -4,
	Z_BUF_ERROR: -5,
	Z_NO_COMPRESSION: 0,
	Z_BEST_SPEED: 1,
	Z_BEST_COMPRESSION: 9,
	Z_DEFAULT_COMPRESSION: -1,
	Z_FILTERED: 1,
	Z_HUFFMAN_ONLY: 2,
	Z_RLE: 3,
	Z_FIXED: 4,
	Z_DEFAULT_STRATEGY: 0,
	Z_BINARY: 0,
	Z_TEXT: 1,
	Z_UNKNOWN: 2,
	Z_DEFLATED: 8
};
var { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;
var { Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1, Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1, Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1, Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1, Z_UNKNOWN, Z_DEFLATED: Z_DEFLATED$2 } = constants$2;
var MAX_MEM_LEVEL = 9;
var MAX_WBITS$1 = 15;
var DEF_MEM_LEVEL = 8;
var L_CODES = 286;
var D_CODES = 30;
var BL_CODES = 19;
var HEAP_SIZE = 2 * L_CODES + 1;
var MAX_BITS = 15;
var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
var PRESET_DICT = 32;
var INIT_STATE = 42;
var GZIP_STATE = 57;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;
var BS_NEED_MORE = 1;
var BS_BLOCK_DONE = 2;
var BS_FINISH_STARTED = 3;
var BS_FINISH_DONE = 4;
var OS_CODE = 3;
var err = (strm, errorCode) => {
	strm.msg = messages[errorCode];
	return errorCode;
};
var rank = (f) => {
	return f * 2 - (f > 4 ? 9 : 0);
};
var zero = (buf) => {
	let len = buf.length;
	while (--len >= 0) buf[len] = 0;
};
var slide_hash = (s) => {
	let n, m;
	let p;
	let wsize = s.w_size;
	n = s.hash_size;
	p = n;
	do {
		m = s.head[--p];
		s.head[p] = m >= wsize ? m - wsize : 0;
	} while (--n);
	n = wsize;
	p = n;
	do {
		m = s.prev[--p];
		s.prev[p] = m >= wsize ? m - wsize : 0;
	} while (--n);
};
var HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
var HASH = HASH_ZLIB;
var flush_pending = (strm) => {
	const s = strm.state;
	let len = s.pending;
	if (len > strm.avail_out) len = strm.avail_out;
	if (len === 0) return;
	strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
	strm.next_out += len;
	s.pending_out += len;
	strm.total_out += len;
	strm.avail_out -= len;
	s.pending -= len;
	if (s.pending === 0) s.pending_out = 0;
};
var flush_block_only = (s, last) => {
	_tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
	s.block_start = s.strstart;
	flush_pending(s.strm);
};
var put_byte = (s, b) => {
	s.pending_buf[s.pending++] = b;
};
var putShortMSB = (s, b) => {
	s.pending_buf[s.pending++] = b >>> 8 & 255;
	s.pending_buf[s.pending++] = b & 255;
};
var read_buf = (strm, buf, start, size) => {
	let len = strm.avail_in;
	if (len > size) len = size;
	if (len === 0) return 0;
	strm.avail_in -= len;
	buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
	if (strm.state.wrap === 1) strm.adler = adler32_1(strm.adler, buf, len, start);
	else if (strm.state.wrap === 2) strm.adler = crc32_1(strm.adler, buf, len, start);
	strm.next_in += len;
	strm.total_in += len;
	return len;
};
var longest_match = (s, cur_match) => {
	let chain_length = s.max_chain_length;
	let scan = s.strstart;
	let match;
	let len;
	let best_len = s.prev_length;
	let nice_match = s.nice_match;
	const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
	const _win = s.window;
	const wmask = s.w_mask;
	const prev = s.prev;
	const strend = s.strstart + MAX_MATCH;
	let scan_end1 = _win[scan + best_len - 1];
	let scan_end = _win[scan + best_len];
	if (s.prev_length >= s.good_match) chain_length >>= 2;
	if (nice_match > s.lookahead) nice_match = s.lookahead;
	do {
		match = cur_match;
		if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) continue;
		scan += 2;
		match++;
		do		;
while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
		len = MAX_MATCH - (strend - scan);
		scan = strend - MAX_MATCH;
		if (len > best_len) {
			s.match_start = cur_match;
			best_len = len;
			if (len >= nice_match) break;
			scan_end1 = _win[scan + best_len - 1];
			scan_end = _win[scan + best_len];
		}
	} while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
	if (best_len <= s.lookahead) return best_len;
	return s.lookahead;
};
var fill_window = (s) => {
	const _w_size = s.w_size;
	let n, more, str;
	do {
		more = s.window_size - s.lookahead - s.strstart;
		if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
			s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
			s.match_start -= _w_size;
			s.strstart -= _w_size;
			s.block_start -= _w_size;
			if (s.insert > s.strstart) s.insert = s.strstart;
			slide_hash(s);
			more += _w_size;
		}
		if (s.strm.avail_in === 0) break;
		n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
		s.lookahead += n;
		if (s.lookahead + s.insert >= MIN_MATCH) {
			str = s.strstart - s.insert;
			s.ins_h = s.window[str];
			s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
			while (s.insert) {
				s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
				s.prev[str & s.w_mask] = s.head[s.ins_h];
				s.head[s.ins_h] = str;
				str++;
				s.insert--;
				if (s.lookahead + s.insert < MIN_MATCH) break;
			}
		}
	} while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
};
var deflate_stored = (s, flush) => {
	let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
	let len, left, have, last = 0;
	let used = s.strm.avail_in;
	do {
		len = 65535;
		have = s.bi_valid + 42 >> 3;
		if (s.strm.avail_out < have) break;
		have = s.strm.avail_out - have;
		left = s.strstart - s.block_start;
		if (len > left + s.strm.avail_in) len = left + s.strm.avail_in;
		if (len > have) len = have;
		if (len < min_block && (len === 0 && flush !== Z_FINISH$3 || flush === Z_NO_FLUSH$2 || len !== left + s.strm.avail_in)) break;
		last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
		_tr_stored_block(s, 0, 0, last);
		s.pending_buf[s.pending - 4] = len;
		s.pending_buf[s.pending - 3] = len >> 8;
		s.pending_buf[s.pending - 2] = ~len;
		s.pending_buf[s.pending - 1] = ~len >> 8;
		flush_pending(s.strm);
		if (left) {
			if (left > len) left = len;
			s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
			s.strm.next_out += left;
			s.strm.avail_out -= left;
			s.strm.total_out += left;
			s.block_start += left;
			len -= left;
		}
		if (len) {
			read_buf(s.strm, s.strm.output, s.strm.next_out, len);
			s.strm.next_out += len;
			s.strm.avail_out -= len;
			s.strm.total_out += len;
		}
	} while (last === 0);
	used -= s.strm.avail_in;
	if (used) {
		if (used >= s.w_size) {
			s.matches = 2;
			s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
			s.strstart = s.w_size;
			s.insert = s.strstart;
		} else {
			if (s.window_size - s.strstart <= used) {
				s.strstart -= s.w_size;
				s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
				if (s.matches < 2) s.matches++;
				if (s.insert > s.strstart) s.insert = s.strstart;
			}
			s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
			s.strstart += used;
			s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
		}
		s.block_start = s.strstart;
	}
	if (s.high_water < s.strstart) s.high_water = s.strstart;
	if (last) return BS_FINISH_DONE;
	if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 && s.strm.avail_in === 0 && s.strstart === s.block_start) return BS_BLOCK_DONE;
	have = s.window_size - s.strstart;
	if (s.strm.avail_in > have && s.block_start >= s.w_size) {
		s.block_start -= s.w_size;
		s.strstart -= s.w_size;
		s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
		if (s.matches < 2) s.matches++;
		have += s.w_size;
		if (s.insert > s.strstart) s.insert = s.strstart;
	}
	if (have > s.strm.avail_in) have = s.strm.avail_in;
	if (have) {
		read_buf(s.strm, s.window, s.strstart, have);
		s.strstart += have;
		s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
	}
	if (s.high_water < s.strstart) s.high_water = s.strstart;
	have = s.bi_valid + 42 >> 3;
	have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
	min_block = have > s.w_size ? s.w_size : have;
	left = s.strstart - s.block_start;
	if (left >= min_block || (left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 && s.strm.avail_in === 0 && left <= have) {
		len = left > have ? have : left;
		last = flush === Z_FINISH$3 && s.strm.avail_in === 0 && len === left ? 1 : 0;
		_tr_stored_block(s, s.block_start, len, last);
		s.block_start += len;
		flush_pending(s.strm);
	}
	return last ? BS_FINISH_STARTED : BS_NEED_MORE;
};
var deflate_fast = (s, flush) => {
	let hash_head;
	let bflush;
	for (;;) {
		if (s.lookahead < MIN_LOOKAHEAD) {
			fill_window(s);
			if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
			if (s.lookahead === 0) break;
		}
		hash_head = 0;
		if (s.lookahead >= MIN_MATCH) {
			/*** INSERT_STRING(s, s.strstart, hash_head); ***/
			s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
			hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
			s.head[s.ins_h] = s.strstart;
		}
		if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) s.match_length = longest_match(s, hash_head);
		if (s.match_length >= MIN_MATCH) {
			/*** _tr_tally_dist(s, s.strstart - s.match_start,
			s.match_length - MIN_MATCH, bflush); ***/
			bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
			s.lookahead -= s.match_length;
			if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
				s.match_length--;
				do {
					s.strstart++;
					/*** INSERT_STRING(s, s.strstart, hash_head); ***/
					s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
					hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
					s.head[s.ins_h] = s.strstart;
				} while (--s.match_length !== 0);
				s.strstart++;
			} else {
				s.strstart += s.match_length;
				s.match_length = 0;
				s.ins_h = s.window[s.strstart];
				s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
			}
		} else {
			/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
			bflush = _tr_tally(s, 0, s.window[s.strstart]);
			s.lookahead--;
			s.strstart++;
		}
		if (bflush) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
	}
	s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
	if (flush === Z_FINISH$3) {
		/*** FLUSH_BLOCK(s, 1); ***/
		flush_block_only(s, true);
		if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
		return BS_FINISH_DONE;
	}
	if (s.sym_next) {
		/*** FLUSH_BLOCK(s, 0); ***/
		flush_block_only(s, false);
		if (s.strm.avail_out === 0) return BS_NEED_MORE;
	}
	return BS_BLOCK_DONE;
};
var deflate_slow = (s, flush) => {
	let hash_head;
	let bflush;
	let max_insert;
	for (;;) {
		if (s.lookahead < MIN_LOOKAHEAD) {
			fill_window(s);
			if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
			if (s.lookahead === 0) break;
		}
		hash_head = 0;
		if (s.lookahead >= MIN_MATCH) {
			/*** INSERT_STRING(s, s.strstart, hash_head); ***/
			s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
			hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
			s.head[s.ins_h] = s.strstart;
		}
		s.prev_length = s.match_length;
		s.prev_match = s.match_start;
		s.match_length = MIN_MATCH - 1;
		if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
			s.match_length = longest_match(s, hash_head);
			if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) s.match_length = MIN_MATCH - 1;
		}
		if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
			max_insert = s.strstart + s.lookahead - MIN_MATCH;
			/***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
			s.prev_length - MIN_MATCH, bflush);***/
			bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
			s.lookahead -= s.prev_length - 1;
			s.prev_length -= 2;
			do
				if (++s.strstart <= max_insert) {
					/*** INSERT_STRING(s, s.strstart, hash_head); ***/
					s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
					hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
					s.head[s.ins_h] = s.strstart;
				}
			while (--s.prev_length !== 0);
			s.match_available = 0;
			s.match_length = MIN_MATCH - 1;
			s.strstart++;
			if (bflush) {
				/*** FLUSH_BLOCK(s, 0); ***/
				flush_block_only(s, false);
				if (s.strm.avail_out === 0) return BS_NEED_MORE;
			}
		} else if (s.match_available) {
			/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
			bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
			if (bflush)
 /*** FLUSH_BLOCK_ONLY(s, 0) ***/
			flush_block_only(s, false);
			s.strstart++;
			s.lookahead--;
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		} else {
			s.match_available = 1;
			s.strstart++;
			s.lookahead--;
		}
	}
	if (s.match_available) {
		/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
		bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
		s.match_available = 0;
	}
	s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
	if (flush === Z_FINISH$3) {
		/*** FLUSH_BLOCK(s, 1); ***/
		flush_block_only(s, true);
		if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
		return BS_FINISH_DONE;
	}
	if (s.sym_next) {
		/*** FLUSH_BLOCK(s, 0); ***/
		flush_block_only(s, false);
		if (s.strm.avail_out === 0) return BS_NEED_MORE;
	}
	return BS_BLOCK_DONE;
};
var deflate_rle = (s, flush) => {
	let bflush;
	let prev;
	let scan, strend;
	const _win = s.window;
	for (;;) {
		if (s.lookahead <= MAX_MATCH) {
			fill_window(s);
			if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
			if (s.lookahead === 0) break;
		}
		s.match_length = 0;
		if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
			scan = s.strstart - 1;
			prev = _win[scan];
			if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
				strend = s.strstart + MAX_MATCH;
				do				;
while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
				s.match_length = MAX_MATCH - (strend - scan);
				if (s.match_length > s.lookahead) s.match_length = s.lookahead;
			}
		}
		if (s.match_length >= MIN_MATCH) {
			/*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
			bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
			s.lookahead -= s.match_length;
			s.strstart += s.match_length;
			s.match_length = 0;
		} else {
			/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
			bflush = _tr_tally(s, 0, s.window[s.strstart]);
			s.lookahead--;
			s.strstart++;
		}
		if (bflush) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
	}
	s.insert = 0;
	if (flush === Z_FINISH$3) {
		/*** FLUSH_BLOCK(s, 1); ***/
		flush_block_only(s, true);
		if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
		return BS_FINISH_DONE;
	}
	if (s.sym_next) {
		/*** FLUSH_BLOCK(s, 0); ***/
		flush_block_only(s, false);
		if (s.strm.avail_out === 0) return BS_NEED_MORE;
	}
	return BS_BLOCK_DONE;
};
var deflate_huff = (s, flush) => {
	let bflush;
	for (;;) {
		if (s.lookahead === 0) {
			fill_window(s);
			if (s.lookahead === 0) {
				if (flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
				break;
			}
		}
		s.match_length = 0;
		/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
		bflush = _tr_tally(s, 0, s.window[s.strstart]);
		s.lookahead--;
		s.strstart++;
		if (bflush) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
	}
	s.insert = 0;
	if (flush === Z_FINISH$3) {
		/*** FLUSH_BLOCK(s, 1); ***/
		flush_block_only(s, true);
		if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
		return BS_FINISH_DONE;
	}
	if (s.sym_next) {
		/*** FLUSH_BLOCK(s, 0); ***/
		flush_block_only(s, false);
		if (s.strm.avail_out === 0) return BS_NEED_MORE;
	}
	return BS_BLOCK_DONE;
};
function Config(good_length, max_lazy, nice_length, max_chain, func) {
	this.good_length = good_length;
	this.max_lazy = max_lazy;
	this.nice_length = nice_length;
	this.max_chain = max_chain;
	this.func = func;
}
var configuration_table = [
	new Config(0, 0, 0, 0, deflate_stored),
	new Config(4, 4, 8, 4, deflate_fast),
	new Config(4, 5, 16, 8, deflate_fast),
	new Config(4, 6, 32, 32, deflate_fast),
	new Config(4, 4, 16, 16, deflate_slow),
	new Config(8, 16, 32, 32, deflate_slow),
	new Config(8, 16, 128, 128, deflate_slow),
	new Config(8, 32, 128, 256, deflate_slow),
	new Config(32, 128, 258, 1024, deflate_slow),
	new Config(32, 258, 258, 4096, deflate_slow)
];
var lm_init = (s) => {
	s.window_size = 2 * s.w_size;
	/*** CLEAR_HASH(s); ***/
	zero(s.head);
	s.max_lazy_match = configuration_table[s.level].max_lazy;
	s.good_match = configuration_table[s.level].good_length;
	s.nice_match = configuration_table[s.level].nice_length;
	s.max_chain_length = configuration_table[s.level].max_chain;
	s.strstart = 0;
	s.block_start = 0;
	s.lookahead = 0;
	s.insert = 0;
	s.match_length = s.prev_length = MIN_MATCH - 1;
	s.match_available = 0;
	s.ins_h = 0;
};
function DeflateState() {
	this.strm = null;
	this.status = 0;
	this.pending_buf = null;
	this.pending_buf_size = 0;
	this.pending_out = 0;
	this.pending = 0;
	this.wrap = 0;
	this.gzhead = null;
	this.gzindex = 0;
	this.method = Z_DEFLATED$2;
	this.last_flush = -1;
	this.w_size = 0;
	this.w_bits = 0;
	this.w_mask = 0;
	this.window = null;
	this.window_size = 0;
	this.prev = null;
	this.head = null;
	this.ins_h = 0;
	this.hash_size = 0;
	this.hash_bits = 0;
	this.hash_mask = 0;
	this.hash_shift = 0;
	this.block_start = 0;
	this.match_length = 0;
	this.prev_match = 0;
	this.match_available = 0;
	this.strstart = 0;
	this.match_start = 0;
	this.lookahead = 0;
	this.prev_length = 0;
	this.max_chain_length = 0;
	this.max_lazy_match = 0;
	this.level = 0;
	this.strategy = 0;
	this.good_match = 0;
	this.nice_match = 0;
	this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
	this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
	this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
	zero(this.dyn_ltree);
	zero(this.dyn_dtree);
	zero(this.bl_tree);
	this.l_desc = null;
	this.d_desc = null;
	this.bl_desc = null;
	this.bl_count = new Uint16Array(MAX_BITS + 1);
	this.heap = new Uint16Array(2 * L_CODES + 1);
	zero(this.heap);
	this.heap_len = 0;
	this.heap_max = 0;
	this.depth = new Uint16Array(2 * L_CODES + 1);
	zero(this.depth);
	this.sym_buf = 0;
	this.lit_bufsize = 0;
	this.sym_next = 0;
	this.sym_end = 0;
	this.opt_len = 0;
	this.static_len = 0;
	this.matches = 0;
	this.insert = 0;
	this.bi_buf = 0;
	this.bi_valid = 0;
}
var deflateStateCheck = (strm) => {
	if (!strm) return 1;
	const s = strm.state;
	if (!s || s.strm !== strm || s.status !== INIT_STATE && s.status !== GZIP_STATE && s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) return 1;
	return 0;
};
var deflateResetKeep = (strm) => {
	if (deflateStateCheck(strm)) return err(strm, Z_STREAM_ERROR$2);
	strm.total_in = strm.total_out = 0;
	strm.data_type = Z_UNKNOWN;
	const s = strm.state;
	s.pending = 0;
	s.pending_out = 0;
	if (s.wrap < 0) s.wrap = -s.wrap;
	s.status = s.wrap === 2 ? GZIP_STATE : s.wrap ? INIT_STATE : BUSY_STATE;
	strm.adler = s.wrap === 2 ? 0 : 1;
	s.last_flush = -2;
	_tr_init(s);
	return Z_OK$3;
};
var deflateReset = (strm) => {
	const ret = deflateResetKeep(strm);
	if (ret === Z_OK$3) lm_init(strm.state);
	return ret;
};
var deflateSetHeader = (strm, head) => {
	if (deflateStateCheck(strm) || strm.state.wrap !== 2) return Z_STREAM_ERROR$2;
	strm.state.gzhead = head;
	return Z_OK$3;
};
var deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
	if (!strm) return Z_STREAM_ERROR$2;
	let wrap = 1;
	if (level === Z_DEFAULT_COMPRESSION$1) level = 6;
	if (windowBits < 0) {
		wrap = 0;
		windowBits = -windowBits;
	} else if (windowBits > 15) {
		wrap = 2;
		windowBits -= 16;
	}
	if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) return err(strm, Z_STREAM_ERROR$2);
	if (windowBits === 8) windowBits = 9;
	const s = new DeflateState();
	strm.state = s;
	s.strm = strm;
	s.status = INIT_STATE;
	s.wrap = wrap;
	s.gzhead = null;
	s.w_bits = windowBits;
	s.w_size = 1 << s.w_bits;
	s.w_mask = s.w_size - 1;
	s.hash_bits = memLevel + 7;
	s.hash_size = 1 << s.hash_bits;
	s.hash_mask = s.hash_size - 1;
	s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
	s.window = new Uint8Array(s.w_size * 2);
	s.head = new Uint16Array(s.hash_size);
	s.prev = new Uint16Array(s.w_size);
	s.lit_bufsize = 1 << memLevel + 6;
	s.pending_buf_size = s.lit_bufsize * 4;
	s.pending_buf = new Uint8Array(s.pending_buf_size);
	s.sym_buf = s.lit_bufsize;
	s.sym_end = (s.lit_bufsize - 1) * 3;
	s.level = level;
	s.strategy = strategy;
	s.method = method;
	return deflateReset(strm);
};
var deflateInit = (strm, level) => {
	return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};
var deflate$2 = (strm, flush) => {
	if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
	const s = strm.state;
	if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH$3) return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
	const old_flush = s.last_flush;
	s.last_flush = flush;
	if (s.pending !== 0) {
		flush_pending(strm);
		if (strm.avail_out === 0) {
			s.last_flush = -1;
			return Z_OK$3;
		}
	} else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) return err(strm, Z_BUF_ERROR$1);
	if (s.status === FINISH_STATE && strm.avail_in !== 0) return err(strm, Z_BUF_ERROR$1);
	if (s.status === INIT_STATE && s.wrap === 0) s.status = BUSY_STATE;
	if (s.status === INIT_STATE) {
		let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
		let level_flags = -1;
		if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) level_flags = 0;
		else if (s.level < 6) level_flags = 1;
		else if (s.level === 6) level_flags = 2;
		else level_flags = 3;
		header |= level_flags << 6;
		if (s.strstart !== 0) header |= PRESET_DICT;
		header += 31 - header % 31;
		putShortMSB(s, header);
		if (s.strstart !== 0) {
			putShortMSB(s, strm.adler >>> 16);
			putShortMSB(s, strm.adler & 65535);
		}
		strm.adler = 1;
		s.status = BUSY_STATE;
		flush_pending(strm);
		if (s.pending !== 0) {
			s.last_flush = -1;
			return Z_OK$3;
		}
	}
	if (s.status === GZIP_STATE) {
		strm.adler = 0;
		put_byte(s, 31);
		put_byte(s, 139);
		put_byte(s, 8);
		if (!s.gzhead) {
			put_byte(s, 0);
			put_byte(s, 0);
			put_byte(s, 0);
			put_byte(s, 0);
			put_byte(s, 0);
			put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
			put_byte(s, OS_CODE);
			s.status = BUSY_STATE;
			flush_pending(strm);
			if (s.pending !== 0) {
				s.last_flush = -1;
				return Z_OK$3;
			}
		} else {
			put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
			put_byte(s, s.gzhead.time & 255);
			put_byte(s, s.gzhead.time >> 8 & 255);
			put_byte(s, s.gzhead.time >> 16 & 255);
			put_byte(s, s.gzhead.time >> 24 & 255);
			put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
			put_byte(s, s.gzhead.os & 255);
			if (s.gzhead.extra && s.gzhead.extra.length) {
				put_byte(s, s.gzhead.extra.length & 255);
				put_byte(s, s.gzhead.extra.length >> 8 & 255);
			}
			if (s.gzhead.hcrc) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
			s.gzindex = 0;
			s.status = EXTRA_STATE;
		}
	}
	if (s.status === EXTRA_STATE) {
		if (s.gzhead.extra) {
			let beg = s.pending;
			let left = (s.gzhead.extra.length & 65535) - s.gzindex;
			while (s.pending + left > s.pending_buf_size) {
				let copy = s.pending_buf_size - s.pending;
				s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
				s.pending = s.pending_buf_size;
				if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
				s.gzindex += copy;
				flush_pending(strm);
				if (s.pending !== 0) {
					s.last_flush = -1;
					return Z_OK$3;
				}
				beg = 0;
				left -= copy;
			}
			let gzhead_extra = new Uint8Array(s.gzhead.extra);
			s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
			s.pending += left;
			if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
			s.gzindex = 0;
		}
		s.status = NAME_STATE;
	}
	if (s.status === NAME_STATE) {
		if (s.gzhead.name) {
			let beg = s.pending;
			let val;
			do {
				if (s.pending === s.pending_buf_size) {
					if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
					flush_pending(strm);
					if (s.pending !== 0) {
						s.last_flush = -1;
						return Z_OK$3;
					}
					beg = 0;
				}
				if (s.gzindex < s.gzhead.name.length) val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
				else val = 0;
				put_byte(s, val);
			} while (val !== 0);
			if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
			s.gzindex = 0;
		}
		s.status = COMMENT_STATE;
	}
	if (s.status === COMMENT_STATE) {
		if (s.gzhead.comment) {
			let beg = s.pending;
			let val;
			do {
				if (s.pending === s.pending_buf_size) {
					if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
					flush_pending(strm);
					if (s.pending !== 0) {
						s.last_flush = -1;
						return Z_OK$3;
					}
					beg = 0;
				}
				if (s.gzindex < s.gzhead.comment.length) val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
				else val = 0;
				put_byte(s, val);
			} while (val !== 0);
			if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
		}
		s.status = HCRC_STATE;
	}
	if (s.status === HCRC_STATE) {
		if (s.gzhead.hcrc) {
			if (s.pending + 2 > s.pending_buf_size) {
				flush_pending(strm);
				if (s.pending !== 0) {
					s.last_flush = -1;
					return Z_OK$3;
				}
			}
			put_byte(s, strm.adler & 255);
			put_byte(s, strm.adler >> 8 & 255);
			strm.adler = 0;
		}
		s.status = BUSY_STATE;
		flush_pending(strm);
		if (s.pending !== 0) {
			s.last_flush = -1;
			return Z_OK$3;
		}
	}
	if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
		let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
		if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) s.status = FINISH_STATE;
		if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
			if (strm.avail_out === 0) s.last_flush = -1;
			return Z_OK$3;
		}
		if (bstate === BS_BLOCK_DONE) {
			if (flush === Z_PARTIAL_FLUSH) _tr_align(s);
			else if (flush !== Z_BLOCK$1) {
				_tr_stored_block(s, 0, 0, false);
				if (flush === Z_FULL_FLUSH$1) {
					/*** CLEAR_HASH(s); ***/ zero(s.head);
					if (s.lookahead === 0) {
						s.strstart = 0;
						s.block_start = 0;
						s.insert = 0;
					}
				}
			}
			flush_pending(strm);
			if (strm.avail_out === 0) {
				s.last_flush = -1;
				return Z_OK$3;
			}
		}
	}
	if (flush !== Z_FINISH$3) return Z_OK$3;
	if (s.wrap <= 0) return Z_STREAM_END$3;
	if (s.wrap === 2) {
		put_byte(s, strm.adler & 255);
		put_byte(s, strm.adler >> 8 & 255);
		put_byte(s, strm.adler >> 16 & 255);
		put_byte(s, strm.adler >> 24 & 255);
		put_byte(s, strm.total_in & 255);
		put_byte(s, strm.total_in >> 8 & 255);
		put_byte(s, strm.total_in >> 16 & 255);
		put_byte(s, strm.total_in >> 24 & 255);
	} else {
		putShortMSB(s, strm.adler >>> 16);
		putShortMSB(s, strm.adler & 65535);
	}
	flush_pending(strm);
	if (s.wrap > 0) s.wrap = -s.wrap;
	return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};
var deflateEnd = (strm) => {
	if (deflateStateCheck(strm)) return Z_STREAM_ERROR$2;
	const status = strm.state.status;
	strm.state = null;
	return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};
var deflateSetDictionary = (strm, dictionary) => {
	let dictLength = dictionary.length;
	if (deflateStateCheck(strm)) return Z_STREAM_ERROR$2;
	const s = strm.state;
	const wrap = s.wrap;
	if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) return Z_STREAM_ERROR$2;
	if (wrap === 1) strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
	s.wrap = 0;
	if (dictLength >= s.w_size) {
		if (wrap === 0) {
			/*** CLEAR_HASH(s); ***/
			zero(s.head);
			s.strstart = 0;
			s.block_start = 0;
			s.insert = 0;
		}
		let tmpDict = new Uint8Array(s.w_size);
		tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
		dictionary = tmpDict;
		dictLength = s.w_size;
	}
	const avail = strm.avail_in;
	const next = strm.next_in;
	const input = strm.input;
	strm.avail_in = dictLength;
	strm.next_in = 0;
	strm.input = dictionary;
	fill_window(s);
	while (s.lookahead >= MIN_MATCH) {
		let str = s.strstart;
		let n = s.lookahead - (MIN_MATCH - 1);
		do {
			s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
			s.prev[str & s.w_mask] = s.head[s.ins_h];
			s.head[s.ins_h] = str;
			str++;
		} while (--n);
		s.strstart = str;
		s.lookahead = MIN_MATCH - 1;
		fill_window(s);
	}
	s.strstart += s.lookahead;
	s.block_start = s.strstart;
	s.insert = s.lookahead;
	s.lookahead = 0;
	s.match_length = s.prev_length = MIN_MATCH - 1;
	s.match_available = 0;
	strm.next_in = next;
	strm.input = input;
	strm.avail_in = avail;
	s.wrap = wrap;
	return Z_OK$3;
};
var deflate_1$2 = {
	deflateInit,
	deflateInit2,
	deflateReset,
	deflateResetKeep,
	deflateSetHeader,
	deflate: deflate$2,
	deflateEnd,
	deflateSetDictionary,
	deflateInfo: "pako deflate (from Nodeca project)"
};
var _has = (obj, key) => {
	return Object.prototype.hasOwnProperty.call(obj, key);
};
var assign = function(obj) {
	const sources = Array.prototype.slice.call(arguments, 1);
	while (sources.length) {
		const source = sources.shift();
		if (!source) continue;
		if (typeof source !== "object") throw new TypeError(source + "must be non-object");
		for (const p in source) if (_has(source, p)) obj[p] = source[p];
	}
	return obj;
};
var flattenChunks = (chunks) => {
	let len = 0;
	for (let i = 0, l = chunks.length; i < l; i++) len += chunks[i].length;
	const result = new Uint8Array(len);
	for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
		let chunk = chunks[i];
		result.set(chunk, pos);
		pos += chunk.length;
	}
	return result;
};
var common = {
	assign,
	flattenChunks
};
var STR_APPLY_UIA_OK = true;
try {
	String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
	STR_APPLY_UIA_OK = false;
}
var _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
_utf8len[254] = _utf8len[254] = 1;
var string2buf = (str) => {
	if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) return new TextEncoder().encode(str);
	let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
	for (m_pos = 0; m_pos < str_len; m_pos++) {
		c = str.charCodeAt(m_pos);
		if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
			c2 = str.charCodeAt(m_pos + 1);
			if ((c2 & 64512) === 56320) {
				c = 65536 + (c - 55296 << 10) + (c2 - 56320);
				m_pos++;
			}
		}
		buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
	}
	buf = new Uint8Array(buf_len);
	for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
		c = str.charCodeAt(m_pos);
		if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
			c2 = str.charCodeAt(m_pos + 1);
			if ((c2 & 64512) === 56320) {
				c = 65536 + (c - 55296 << 10) + (c2 - 56320);
				m_pos++;
			}
		}
		if (c < 128) buf[i++] = c;
		else if (c < 2048) {
			buf[i++] = 192 | c >>> 6;
			buf[i++] = 128 | c & 63;
		} else if (c < 65536) {
			buf[i++] = 224 | c >>> 12;
			buf[i++] = 128 | c >>> 6 & 63;
			buf[i++] = 128 | c & 63;
		} else {
			buf[i++] = 240 | c >>> 18;
			buf[i++] = 128 | c >>> 12 & 63;
			buf[i++] = 128 | c >>> 6 & 63;
			buf[i++] = 128 | c & 63;
		}
	}
	return buf;
};
var buf2binstring = (buf, len) => {
	if (len < 65534) {
		if (buf.subarray && STR_APPLY_UIA_OK) return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
	}
	let result = "";
	for (let i = 0; i < len; i++) result += String.fromCharCode(buf[i]);
	return result;
};
var buf2string = (buf, max) => {
	const len = max || buf.length;
	if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) return new TextDecoder().decode(buf.subarray(0, max));
	let i, out;
	const utf16buf = new Array(len * 2);
	for (out = 0, i = 0; i < len;) {
		let c = buf[i++];
		if (c < 128) {
			utf16buf[out++] = c;
			continue;
		}
		let c_len = _utf8len[c];
		if (c_len > 4) {
			utf16buf[out++] = 65533;
			i += c_len - 1;
			continue;
		}
		c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
		while (c_len > 1 && i < len) {
			c = c << 6 | buf[i++] & 63;
			c_len--;
		}
		if (c_len > 1) {
			utf16buf[out++] = 65533;
			continue;
		}
		if (c < 65536) utf16buf[out++] = c;
		else {
			c -= 65536;
			utf16buf[out++] = 55296 | c >> 10 & 1023;
			utf16buf[out++] = 56320 | c & 1023;
		}
	}
	return buf2binstring(utf16buf, out);
};
var utf8border = (buf, max) => {
	max = max || buf.length;
	if (max > buf.length) max = buf.length;
	let pos = max - 1;
	while (pos >= 0 && (buf[pos] & 192) === 128) pos--;
	if (pos < 0) return max;
	if (pos === 0) return max;
	return pos + _utf8len[buf[pos]] > max ? pos : max;
};
var strings = {
	string2buf,
	buf2string,
	utf8border
};
function ZStream() {
	this.input = null;
	this.next_in = 0;
	this.avail_in = 0;
	this.total_in = 0;
	this.output = null;
	this.next_out = 0;
	this.avail_out = 0;
	this.total_out = 0;
	this.msg = "";
	this.state = null;
	this.data_type = 2;
	this.adler = 0;
}
var zstream = ZStream;
var toString$1 = Object.prototype.toString;
var { Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2, Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2, Z_DEFAULT_COMPRESSION, Z_DEFAULT_STRATEGY, Z_DEFLATED: Z_DEFLATED$1 } = constants$2;
/**
* class Deflate
*
* Generic JS-style wrapper for zlib calls. If you don't need
* streaming behaviour - use more simple functions: [[deflate]],
* [[deflateRaw]] and [[gzip]].
**/
/**
* Deflate.result -> Uint8Array
*
* Compressed result, generated by default [[Deflate#onData]]
* and [[Deflate#onEnd]] handlers. Filled after you push last chunk
* (call [[Deflate#push]] with `Z_FINISH` / `true` param).
**/
/**
* Deflate.err -> Number
*
* Error code after deflate finished. 0 (Z_OK) on success.
* You will not need it in real life, because deflate errors
* are possible only on wrong options or bad `onData` / `onEnd`
* custom handlers.
**/
/**
* Deflate.msg -> String
*
* Error message, if [[Deflate.err]] != 0
**/
/**
* new Deflate(options)
* - options (Object): zlib deflate options.
*
* Creates new deflator instance with specified params. Throws exception
* on bad params. Supported options:
*
* - `level`
* - `windowBits`
* - `memLevel`
* - `strategy`
* - `dictionary`
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* Additional options, for internal needs:
*
* - `chunkSize` - size of generated data chunks (16K by default)
* - `raw` (Boolean) - do raw deflate
* - `gzip` (Boolean) - create gzip wrapper
* - `header` (Object) - custom header for gzip
*   - `text` (Boolean) - true if compressed data believed to be text
*   - `time` (Number) - modification time, unix timestamp
*   - `os` (Number) - operation system code
*   - `extra` (Array) - array of bytes with extra data (max 65536)
*   - `name` (String) - file name (binary string)
*   - `comment` (String) - comment (binary string)
*   - `hcrc` (Boolean) - true if header crc should be added
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
*   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
*   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
*
* const deflate = new pako.Deflate({ level: 3});
*
* deflate.push(chunk1, false);
* deflate.push(chunk2, true);  // true -> last chunk
*
* if (deflate.err) { throw new Error(deflate.err); }
*
* console.log(deflate.result);
* ```
**/
function Deflate$1(options) {
	this.options = common.assign({
		level: Z_DEFAULT_COMPRESSION,
		method: Z_DEFLATED$1,
		chunkSize: 16384,
		windowBits: 15,
		memLevel: 8,
		strategy: Z_DEFAULT_STRATEGY
	}, options || {});
	let opt = this.options;
	if (opt.raw && opt.windowBits > 0) opt.windowBits = -opt.windowBits;
	else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) opt.windowBits += 16;
	this.err = 0;
	this.msg = "";
	this.ended = false;
	this.chunks = [];
	this.strm = new zstream();
	this.strm.avail_out = 0;
	let status = deflate_1$2.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
	if (status !== Z_OK$2) throw new Error(messages[status]);
	if (opt.header) deflate_1$2.deflateSetHeader(this.strm, opt.header);
	if (opt.dictionary) {
		let dict;
		if (typeof opt.dictionary === "string") dict = strings.string2buf(opt.dictionary);
		else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") dict = new Uint8Array(opt.dictionary);
		else dict = opt.dictionary;
		status = deflate_1$2.deflateSetDictionary(this.strm, dict);
		if (status !== Z_OK$2) throw new Error(messages[status]);
		this._dict_set = true;
	}
}
/**
* Deflate#push(data[, flush_mode]) -> Boolean
* - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
*   converted to utf8 byte sequence.
* - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
*   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
*
* Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
* new compressed chunks. Returns `true` on success. The last data block must
* have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
* buffers and call [[Deflate#onEnd]].
*
* On fail call [[Deflate#onEnd]] with error code and return false.
*
* ##### Example
*
* ```javascript
* push(chunk, false); // push one of data chunks
* ...
* push(chunk, true);  // push last chunk
* ```
**/
Deflate$1.prototype.push = function(data, flush_mode) {
	const strm = this.strm;
	const chunkSize = this.options.chunkSize;
	let status, _flush_mode;
	if (this.ended) return false;
	if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
	else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
	if (typeof data === "string") strm.input = strings.string2buf(data);
	else if (toString$1.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
	else strm.input = data;
	strm.next_in = 0;
	strm.avail_in = strm.input.length;
	for (;;) {
		if (strm.avail_out === 0) {
			strm.output = new Uint8Array(chunkSize);
			strm.next_out = 0;
			strm.avail_out = chunkSize;
		}
		if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
			this.onData(strm.output.subarray(0, strm.next_out));
			strm.avail_out = 0;
			continue;
		}
		status = deflate_1$2.deflate(strm, _flush_mode);
		if (status === Z_STREAM_END$2) {
			if (strm.next_out > 0) this.onData(strm.output.subarray(0, strm.next_out));
			status = deflate_1$2.deflateEnd(this.strm);
			this.onEnd(status);
			this.ended = true;
			return status === Z_OK$2;
		}
		if (strm.avail_out === 0) {
			this.onData(strm.output);
			continue;
		}
		if (_flush_mode > 0 && strm.next_out > 0) {
			this.onData(strm.output.subarray(0, strm.next_out));
			strm.avail_out = 0;
			continue;
		}
		if (strm.avail_in === 0) break;
	}
	return true;
};
/**
* Deflate#onData(chunk) -> Void
* - chunk (Uint8Array): output data.
*
* By default, stores data blocks in `chunks[]` property and glue
* those in `onEnd`. Override this handler, if you need another behaviour.
**/
Deflate$1.prototype.onData = function(chunk) {
	this.chunks.push(chunk);
};
/**
* Deflate#onEnd(status) -> Void
* - status (Number): deflate status. 0 (Z_OK) on success,
*   other if not.
*
* Called once after you tell deflate that the input stream is
* complete (Z_FINISH). By default - join collected chunks,
* free memory and fill `results` / `err` properties.
**/
Deflate$1.prototype.onEnd = function(status) {
	if (status === Z_OK$2) this.result = common.flattenChunks(this.chunks);
	this.chunks = [];
	this.err = status;
	this.msg = this.strm.msg;
};
/**
* deflate(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* Compress `data` with deflate algorithm and `options`.
*
* Supported options are:
*
* - level
* - windowBits
* - memLevel
* - strategy
* - dictionary
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* Sugar (options):
*
* - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
*   negative windowBits implicitly.
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
* const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
*
* console.log(pako.deflate(data));
* ```
**/
function deflate$1(input, options) {
	const deflator = new Deflate$1(options);
	deflator.push(input, true);
	if (deflator.err) throw deflator.msg || messages[deflator.err];
	return deflator.result;
}
/**
* deflateRaw(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* The same as [[deflate]], but creates raw data, without wrapper
* (header and adler32 crc).
**/
function deflateRaw$1(input, options) {
	options = options || {};
	options.raw = true;
	return deflate$1(input, options);
}
/**
* gzip(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* The same as [[deflate]], but create gzip wrapper instead of
* deflate one.
**/
function gzip$1(input, options) {
	options = options || {};
	options.gzip = true;
	return deflate$1(input, options);
}
var deflate_1$1 = {
	Deflate: Deflate$1,
	deflate: deflate$1,
	deflateRaw: deflateRaw$1,
	gzip: gzip$1,
	constants: constants$2
};
var BAD$1 = 16209;
var TYPE$1 = 16191;
var inffast = function inflate_fast(strm, start) {
	let _in;
	let last;
	let _out;
	let beg;
	let end;
	let dmax;
	let wsize;
	let whave;
	let wnext;
	let s_window;
	let hold;
	let bits;
	let lcode;
	let dcode;
	let lmask;
	let dmask;
	let here;
	let op;
	let len;
	let dist;
	let from;
	let from_source;
	let input, output;
	const state = strm.state;
	_in = strm.next_in;
	input = strm.input;
	last = _in + (strm.avail_in - 5);
	_out = strm.next_out;
	output = strm.output;
	beg = _out - (start - strm.avail_out);
	end = _out + (strm.avail_out - 257);
	dmax = state.dmax;
	wsize = state.wsize;
	whave = state.whave;
	wnext = state.wnext;
	s_window = state.window;
	hold = state.hold;
	bits = state.bits;
	lcode = state.lencode;
	dcode = state.distcode;
	lmask = (1 << state.lenbits) - 1;
	dmask = (1 << state.distbits) - 1;
	top: do {
		if (bits < 15) {
			hold += input[_in++] << bits;
			bits += 8;
			hold += input[_in++] << bits;
			bits += 8;
		}
		here = lcode[hold & lmask];
		dolen: for (;;) {
			op = here >>> 24;
			hold >>>= op;
			bits -= op;
			op = here >>> 16 & 255;
			if (op === 0) output[_out++] = here & 65535;
			else if (op & 16) {
				len = here & 65535;
				op &= 15;
				if (op) {
					if (bits < op) {
						hold += input[_in++] << bits;
						bits += 8;
					}
					len += hold & (1 << op) - 1;
					hold >>>= op;
					bits -= op;
				}
				if (bits < 15) {
					hold += input[_in++] << bits;
					bits += 8;
					hold += input[_in++] << bits;
					bits += 8;
				}
				here = dcode[hold & dmask];
				dodist: for (;;) {
					op = here >>> 24;
					hold >>>= op;
					bits -= op;
					op = here >>> 16 & 255;
					if (op & 16) {
						dist = here & 65535;
						op &= 15;
						if (bits < op) {
							hold += input[_in++] << bits;
							bits += 8;
							if (bits < op) {
								hold += input[_in++] << bits;
								bits += 8;
							}
						}
						dist += hold & (1 << op) - 1;
						if (dist > dmax) {
							strm.msg = "invalid distance too far back";
							state.mode = BAD$1;
							break top;
						}
						hold >>>= op;
						bits -= op;
						op = _out - beg;
						if (dist > op) {
							op = dist - op;
							if (op > whave) {
								if (state.sane) {
									strm.msg = "invalid distance too far back";
									state.mode = BAD$1;
									break top;
								}
							}
							from = 0;
							from_source = s_window;
							if (wnext === 0) {
								from += wsize - op;
								if (op < len) {
									len -= op;
									do
										output[_out++] = s_window[from++];
									while (--op);
									from = _out - dist;
									from_source = output;
								}
							} else if (wnext < op) {
								from += wsize + wnext - op;
								op -= wnext;
								if (op < len) {
									len -= op;
									do
										output[_out++] = s_window[from++];
									while (--op);
									from = 0;
									if (wnext < len) {
										op = wnext;
										len -= op;
										do
											output[_out++] = s_window[from++];
										while (--op);
										from = _out - dist;
										from_source = output;
									}
								}
							} else {
								from += wnext - op;
								if (op < len) {
									len -= op;
									do
										output[_out++] = s_window[from++];
									while (--op);
									from = _out - dist;
									from_source = output;
								}
							}
							while (len > 2) {
								output[_out++] = from_source[from++];
								output[_out++] = from_source[from++];
								output[_out++] = from_source[from++];
								len -= 3;
							}
							if (len) {
								output[_out++] = from_source[from++];
								if (len > 1) output[_out++] = from_source[from++];
							}
						} else {
							from = _out - dist;
							do {
								output[_out++] = output[from++];
								output[_out++] = output[from++];
								output[_out++] = output[from++];
								len -= 3;
							} while (len > 2);
							if (len) {
								output[_out++] = output[from++];
								if (len > 1) output[_out++] = output[from++];
							}
						}
					} else if ((op & 64) === 0) {
						here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
						continue dodist;
					} else {
						strm.msg = "invalid distance code";
						state.mode = BAD$1;
						break top;
					}
					break;
				}
			} else if ((op & 64) === 0) {
				here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
				continue dolen;
			} else if (op & 32) {
				state.mode = TYPE$1;
				break top;
			} else {
				strm.msg = "invalid literal/length code";
				state.mode = BAD$1;
				break top;
			}
			break;
		}
	} while (_in < last && _out < end);
	len = bits >> 3;
	_in -= len;
	bits -= len << 3;
	hold &= (1 << bits) - 1;
	strm.next_in = _in;
	strm.next_out = _out;
	strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
	strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
	state.hold = hold;
	state.bits = bits;
};
var MAXBITS = 15;
var ENOUGH_LENS$1 = 852;
var ENOUGH_DISTS$1 = 592;
var CODES$1 = 0;
var LENS$1 = 1;
var DISTS$1 = 2;
var lbase = new Uint16Array([
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	13,
	15,
	17,
	19,
	23,
	27,
	31,
	35,
	43,
	51,
	59,
	67,
	83,
	99,
	115,
	131,
	163,
	195,
	227,
	258,
	0,
	0
]);
var lext = new Uint8Array([
	16,
	16,
	16,
	16,
	16,
	16,
	16,
	16,
	17,
	17,
	17,
	17,
	18,
	18,
	18,
	18,
	19,
	19,
	19,
	19,
	20,
	20,
	20,
	20,
	21,
	21,
	21,
	21,
	16,
	72,
	78
]);
var dbase = new Uint16Array([
	1,
	2,
	3,
	4,
	5,
	7,
	9,
	13,
	17,
	25,
	33,
	49,
	65,
	97,
	129,
	193,
	257,
	385,
	513,
	769,
	1025,
	1537,
	2049,
	3073,
	4097,
	6145,
	8193,
	12289,
	16385,
	24577,
	0,
	0
]);
var dext = new Uint8Array([
	16,
	16,
	16,
	16,
	17,
	17,
	18,
	18,
	19,
	19,
	20,
	20,
	21,
	21,
	22,
	22,
	23,
	23,
	24,
	24,
	25,
	25,
	26,
	26,
	27,
	27,
	28,
	28,
	29,
	29,
	64,
	64
]);
var inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
	const bits = opts.bits;
	let len = 0;
	let sym = 0;
	let min = 0, max = 0;
	let root = 0;
	let curr = 0;
	let drop = 0;
	let left = 0;
	let used = 0;
	let huff = 0;
	let incr;
	let fill;
	let low;
	let mask;
	let next;
	let base = null;
	let match;
	const count = new Uint16Array(MAXBITS + 1);
	const offs = new Uint16Array(MAXBITS + 1);
	let extra = null;
	let here_bits, here_op, here_val;
	for (len = 0; len <= MAXBITS; len++) count[len] = 0;
	for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
	root = bits;
	for (max = MAXBITS; max >= 1; max--) if (count[max] !== 0) break;
	if (root > max) root = max;
	if (max === 0) {
		table[table_index++] = 20971520;
		table[table_index++] = 20971520;
		opts.bits = 1;
		return 0;
	}
	for (min = 1; min < max; min++) if (count[min] !== 0) break;
	if (root < min) root = min;
	left = 1;
	for (len = 1; len <= MAXBITS; len++) {
		left <<= 1;
		left -= count[len];
		if (left < 0) return -1;
	}
	if (left > 0 && (type === CODES$1 || max !== 1)) return -1;
	offs[1] = 0;
	for (len = 1; len < MAXBITS; len++) offs[len + 1] = offs[len] + count[len];
	for (sym = 0; sym < codes; sym++) if (lens[lens_index + sym] !== 0) work[offs[lens[lens_index + sym]]++] = sym;
	if (type === CODES$1) {
		base = extra = work;
		match = 20;
	} else if (type === LENS$1) {
		base = lbase;
		extra = lext;
		match = 257;
	} else {
		base = dbase;
		extra = dext;
		match = 0;
	}
	huff = 0;
	sym = 0;
	len = min;
	next = table_index;
	curr = root;
	drop = 0;
	low = -1;
	used = 1 << root;
	mask = used - 1;
	if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
	for (;;) {
		here_bits = len - drop;
		if (work[sym] + 1 < match) {
			here_op = 0;
			here_val = work[sym];
		} else if (work[sym] >= match) {
			here_op = extra[work[sym] - match];
			here_val = base[work[sym] - match];
		} else {
			here_op = 96;
			here_val = 0;
		}
		incr = 1 << len - drop;
		fill = 1 << curr;
		min = fill;
		do {
			fill -= incr;
			table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
		} while (fill !== 0);
		incr = 1 << len - 1;
		while (huff & incr) incr >>= 1;
		if (incr !== 0) {
			huff &= incr - 1;
			huff += incr;
		} else huff = 0;
		sym++;
		if (--count[len] === 0) {
			if (len === max) break;
			len = lens[lens_index + work[sym]];
		}
		if (len > root && (huff & mask) !== low) {
			if (drop === 0) drop = root;
			next += min;
			curr = len - drop;
			left = 1 << curr;
			while (curr + drop < max) {
				left -= count[curr + drop];
				if (left <= 0) break;
				curr++;
				left <<= 1;
			}
			used += 1 << curr;
			if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
			low = huff & mask;
			table[low] = root << 24 | curr << 16 | next - table_index | 0;
		}
	}
	if (huff !== 0) table[next + huff] = len - drop << 24 | 4194304;
	opts.bits = root;
	return 0;
};
var inftrees = inflate_table;
var CODES = 0;
var LENS = 1;
var DISTS = 2;
var { Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES, Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR, Z_DEFLATED } = constants$2;
var HEAD = 16180;
var FLAGS = 16181;
var TIME = 16182;
var OS = 16183;
var EXLEN = 16184;
var EXTRA = 16185;
var NAME = 16186;
var COMMENT = 16187;
var HCRC = 16188;
var DICTID = 16189;
var DICT = 16190;
var TYPE = 16191;
var TYPEDO = 16192;
var STORED = 16193;
var COPY_ = 16194;
var COPY = 16195;
var TABLE = 16196;
var LENLENS = 16197;
var CODELENS = 16198;
var LEN_ = 16199;
var LEN = 16200;
var LENEXT = 16201;
var DIST = 16202;
var DISTEXT = 16203;
var MATCH = 16204;
var LIT = 16205;
var CHECK = 16206;
var LENGTH = 16207;
var DONE = 16208;
var BAD = 16209;
var MEM = 16210;
var SYNC = 16211;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
var DEF_WBITS = 15;
var zswap32 = (q) => {
	return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
};
function InflateState() {
	this.strm = null;
	this.mode = 0;
	this.last = false;
	this.wrap = 0;
	this.havedict = false;
	this.flags = 0;
	this.dmax = 0;
	this.check = 0;
	this.total = 0;
	this.head = null;
	this.wbits = 0;
	this.wsize = 0;
	this.whave = 0;
	this.wnext = 0;
	this.window = null;
	this.hold = 0;
	this.bits = 0;
	this.length = 0;
	this.offset = 0;
	this.extra = 0;
	this.lencode = null;
	this.distcode = null;
	this.lenbits = 0;
	this.distbits = 0;
	this.ncode = 0;
	this.nlen = 0;
	this.ndist = 0;
	this.have = 0;
	this.next = null;
	this.lens = new Uint16Array(320);
	this.work = new Uint16Array(288);
	this.lendyn = null;
	this.distdyn = null;
	this.sane = 0;
	this.back = 0;
	this.was = 0;
}
var inflateStateCheck = (strm) => {
	if (!strm) return 1;
	const state = strm.state;
	if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) return 1;
	return 0;
};
var inflateResetKeep = (strm) => {
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	const state = strm.state;
	strm.total_in = strm.total_out = state.total = 0;
	strm.msg = "";
	if (state.wrap) strm.adler = state.wrap & 1;
	state.mode = HEAD;
	state.last = 0;
	state.havedict = 0;
	state.flags = -1;
	state.dmax = 32768;
	state.head = null;
	state.hold = 0;
	state.bits = 0;
	state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
	state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
	state.sane = 1;
	state.back = -1;
	return Z_OK$1;
};
var inflateReset = (strm) => {
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	const state = strm.state;
	state.wsize = 0;
	state.whave = 0;
	state.wnext = 0;
	return inflateResetKeep(strm);
};
var inflateReset2 = (strm, windowBits) => {
	let wrap;
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	const state = strm.state;
	if (windowBits < 0) {
		wrap = 0;
		windowBits = -windowBits;
	} else {
		wrap = (windowBits >> 4) + 5;
		if (windowBits < 48) windowBits &= 15;
	}
	if (windowBits && (windowBits < 8 || windowBits > 15)) return Z_STREAM_ERROR$1;
	if (state.window !== null && state.wbits !== windowBits) state.window = null;
	state.wrap = wrap;
	state.wbits = windowBits;
	return inflateReset(strm);
};
var inflateInit2 = (strm, windowBits) => {
	if (!strm) return Z_STREAM_ERROR$1;
	const state = new InflateState();
	strm.state = state;
	state.strm = strm;
	state.window = null;
	state.mode = HEAD;
	const ret = inflateReset2(strm, windowBits);
	if (ret !== Z_OK$1) strm.state = null;
	return ret;
};
var inflateInit = (strm) => {
	return inflateInit2(strm, DEF_WBITS);
};
var virgin = true;
var lenfix, distfix;
var fixedtables = (state) => {
	if (virgin) {
		lenfix = new Int32Array(512);
		distfix = new Int32Array(32);
		let sym = 0;
		while (sym < 144) state.lens[sym++] = 8;
		while (sym < 256) state.lens[sym++] = 9;
		while (sym < 280) state.lens[sym++] = 7;
		while (sym < 288) state.lens[sym++] = 8;
		inftrees(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
		sym = 0;
		while (sym < 32) state.lens[sym++] = 5;
		inftrees(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
		virgin = false;
	}
	state.lencode = lenfix;
	state.lenbits = 9;
	state.distcode = distfix;
	state.distbits = 5;
};
var updatewindow = (strm, src, end, copy) => {
	let dist;
	const state = strm.state;
	if (state.window === null) {
		state.wsize = 1 << state.wbits;
		state.wnext = 0;
		state.whave = 0;
		state.window = new Uint8Array(state.wsize);
	}
	if (copy >= state.wsize) {
		state.window.set(src.subarray(end - state.wsize, end), 0);
		state.wnext = 0;
		state.whave = state.wsize;
	} else {
		dist = state.wsize - state.wnext;
		if (dist > copy) dist = copy;
		state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
		copy -= dist;
		if (copy) {
			state.window.set(src.subarray(end - copy, end), 0);
			state.wnext = copy;
			state.whave = state.wsize;
		} else {
			state.wnext += dist;
			if (state.wnext === state.wsize) state.wnext = 0;
			if (state.whave < state.wsize) state.whave += dist;
		}
	}
	return 0;
};
var inflate$2 = (strm, flush) => {
	let state;
	let input, output;
	let next;
	let put;
	let have, left;
	let hold;
	let bits;
	let _in, _out;
	let copy;
	let from;
	let from_source;
	let here = 0;
	let here_bits, here_op, here_val;
	let last_bits, last_op, last_val;
	let len;
	let ret;
	const hbuf = new Uint8Array(4);
	let opts;
	let n;
	const order = new Uint8Array([
		16,
		17,
		18,
		0,
		8,
		7,
		9,
		6,
		10,
		5,
		11,
		4,
		12,
		3,
		13,
		2,
		14,
		1,
		15
	]);
	if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) return Z_STREAM_ERROR$1;
	state = strm.state;
	if (state.mode === TYPE) state.mode = TYPEDO;
	put = strm.next_out;
	output = strm.output;
	left = strm.avail_out;
	next = strm.next_in;
	input = strm.input;
	have = strm.avail_in;
	hold = state.hold;
	bits = state.bits;
	_in = have;
	_out = left;
	ret = Z_OK$1;
	inf_leave: for (;;) switch (state.mode) {
		case HEAD:
			if (state.wrap === 0) {
				state.mode = TYPEDO;
				break;
			}
			while (bits < 16) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if (state.wrap & 2 && hold === 35615) {
				if (state.wbits === 0) state.wbits = 15;
				state.check = 0;
				hbuf[0] = hold & 255;
				hbuf[1] = hold >>> 8 & 255;
				state.check = crc32_1(state.check, hbuf, 2, 0);
				hold = 0;
				bits = 0;
				state.mode = FLAGS;
				break;
			}
			if (state.head) state.head.done = false;
			if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
				strm.msg = "incorrect header check";
				state.mode = BAD;
				break;
			}
			if ((hold & 15) !== Z_DEFLATED) {
				strm.msg = "unknown compression method";
				state.mode = BAD;
				break;
			}
			hold >>>= 4;
			bits -= 4;
			len = (hold & 15) + 8;
			if (state.wbits === 0) state.wbits = len;
			if (len > 15 || len > state.wbits) {
				strm.msg = "invalid window size";
				state.mode = BAD;
				break;
			}
			state.dmax = 1 << state.wbits;
			state.flags = 0;
			strm.adler = state.check = 1;
			state.mode = hold & 512 ? DICTID : TYPE;
			hold = 0;
			bits = 0;
			break;
		case FLAGS:
			while (bits < 16) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			state.flags = hold;
			if ((state.flags & 255) !== Z_DEFLATED) {
				strm.msg = "unknown compression method";
				state.mode = BAD;
				break;
			}
			if (state.flags & 57344) {
				strm.msg = "unknown header flags set";
				state.mode = BAD;
				break;
			}
			if (state.head) state.head.text = hold >> 8 & 1;
			if (state.flags & 512 && state.wrap & 4) {
				hbuf[0] = hold & 255;
				hbuf[1] = hold >>> 8 & 255;
				state.check = crc32_1(state.check, hbuf, 2, 0);
			}
			hold = 0;
			bits = 0;
			state.mode = TIME;
		case TIME:
			while (bits < 32) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if (state.head) state.head.time = hold;
			if (state.flags & 512 && state.wrap & 4) {
				hbuf[0] = hold & 255;
				hbuf[1] = hold >>> 8 & 255;
				hbuf[2] = hold >>> 16 & 255;
				hbuf[3] = hold >>> 24 & 255;
				state.check = crc32_1(state.check, hbuf, 4, 0);
			}
			hold = 0;
			bits = 0;
			state.mode = OS;
		case OS:
			while (bits < 16) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if (state.head) {
				state.head.xflags = hold & 255;
				state.head.os = hold >> 8;
			}
			if (state.flags & 512 && state.wrap & 4) {
				hbuf[0] = hold & 255;
				hbuf[1] = hold >>> 8 & 255;
				state.check = crc32_1(state.check, hbuf, 2, 0);
			}
			hold = 0;
			bits = 0;
			state.mode = EXLEN;
		case EXLEN:
			if (state.flags & 1024) {
				while (bits < 16) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.length = hold;
				if (state.head) state.head.extra_len = hold;
				if (state.flags & 512 && state.wrap & 4) {
					hbuf[0] = hold & 255;
					hbuf[1] = hold >>> 8 & 255;
					state.check = crc32_1(state.check, hbuf, 2, 0);
				}
				hold = 0;
				bits = 0;
			} else if (state.head) state.head.extra = null;
			state.mode = EXTRA;
		case EXTRA:
			if (state.flags & 1024) {
				copy = state.length;
				if (copy > have) copy = have;
				if (copy) {
					if (state.head) {
						len = state.head.extra_len - state.length;
						if (!state.head.extra) state.head.extra = new Uint8Array(state.head.extra_len);
						state.head.extra.set(input.subarray(next, next + copy), len);
					}
					if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
					have -= copy;
					next += copy;
					state.length -= copy;
				}
				if (state.length) break inf_leave;
			}
			state.length = 0;
			state.mode = NAME;
		case NAME:
			if (state.flags & 2048) {
				if (have === 0) break inf_leave;
				copy = 0;
				do {
					len = input[next + copy++];
					if (state.head && len && state.length < 65536) state.head.name += String.fromCharCode(len);
				} while (len && copy < have);
				if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
				have -= copy;
				next += copy;
				if (len) break inf_leave;
			} else if (state.head) state.head.name = null;
			state.length = 0;
			state.mode = COMMENT;
		case COMMENT:
			if (state.flags & 4096) {
				if (have === 0) break inf_leave;
				copy = 0;
				do {
					len = input[next + copy++];
					if (state.head && len && state.length < 65536) state.head.comment += String.fromCharCode(len);
				} while (len && copy < have);
				if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
				have -= copy;
				next += copy;
				if (len) break inf_leave;
			} else if (state.head) state.head.comment = null;
			state.mode = HCRC;
		case HCRC:
			if (state.flags & 512) {
				while (bits < 16) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (state.wrap & 4 && hold !== (state.check & 65535)) {
					strm.msg = "header crc mismatch";
					state.mode = BAD;
					break;
				}
				hold = 0;
				bits = 0;
			}
			if (state.head) {
				state.head.hcrc = state.flags >> 9 & 1;
				state.head.done = true;
			}
			strm.adler = state.check = 0;
			state.mode = TYPE;
			break;
		case DICTID:
			while (bits < 32) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			strm.adler = state.check = zswap32(hold);
			hold = 0;
			bits = 0;
			state.mode = DICT;
		case DICT:
			if (state.havedict === 0) {
				strm.next_out = put;
				strm.avail_out = left;
				strm.next_in = next;
				strm.avail_in = have;
				state.hold = hold;
				state.bits = bits;
				return Z_NEED_DICT$1;
			}
			strm.adler = state.check = 1;
			state.mode = TYPE;
		case TYPE: if (flush === Z_BLOCK || flush === Z_TREES) break inf_leave;
		case TYPEDO:
			if (state.last) {
				hold >>>= bits & 7;
				bits -= bits & 7;
				state.mode = CHECK;
				break;
			}
			while (bits < 3) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			state.last = hold & 1;
			hold >>>= 1;
			bits -= 1;
			switch (hold & 3) {
				case 0:
					state.mode = STORED;
					break;
				case 1:
					fixedtables(state);
					state.mode = LEN_;
					if (flush === Z_TREES) {
						hold >>>= 2;
						bits -= 2;
						break inf_leave;
					}
					break;
				case 2:
					state.mode = TABLE;
					break;
				case 3:
					strm.msg = "invalid block type";
					state.mode = BAD;
			}
			hold >>>= 2;
			bits -= 2;
			break;
		case STORED:
			hold >>>= bits & 7;
			bits -= bits & 7;
			while (bits < 32) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
				strm.msg = "invalid stored block lengths";
				state.mode = BAD;
				break;
			}
			state.length = hold & 65535;
			hold = 0;
			bits = 0;
			state.mode = COPY_;
			if (flush === Z_TREES) break inf_leave;
		case COPY_: state.mode = COPY;
		case COPY:
			copy = state.length;
			if (copy) {
				if (copy > have) copy = have;
				if (copy > left) copy = left;
				if (copy === 0) break inf_leave;
				output.set(input.subarray(next, next + copy), put);
				have -= copy;
				next += copy;
				left -= copy;
				put += copy;
				state.length -= copy;
				break;
			}
			state.mode = TYPE;
			break;
		case TABLE:
			while (bits < 14) {
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			state.nlen = (hold & 31) + 257;
			hold >>>= 5;
			bits -= 5;
			state.ndist = (hold & 31) + 1;
			hold >>>= 5;
			bits -= 5;
			state.ncode = (hold & 15) + 4;
			hold >>>= 4;
			bits -= 4;
			if (state.nlen > 286 || state.ndist > 30) {
				strm.msg = "too many length or distance symbols";
				state.mode = BAD;
				break;
			}
			state.have = 0;
			state.mode = LENLENS;
		case LENLENS:
			while (state.have < state.ncode) {
				while (bits < 3) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.lens[order[state.have++]] = hold & 7;
				hold >>>= 3;
				bits -= 3;
			}
			while (state.have < 19) state.lens[order[state.have++]] = 0;
			state.lencode = state.lendyn;
			state.lenbits = 7;
			opts = { bits: state.lenbits };
			ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
			state.lenbits = opts.bits;
			if (ret) {
				strm.msg = "invalid code lengths set";
				state.mode = BAD;
				break;
			}
			state.have = 0;
			state.mode = CODELENS;
		case CODELENS:
			while (state.have < state.nlen + state.ndist) {
				for (;;) {
					here = state.lencode[hold & (1 << state.lenbits) - 1];
					here_bits = here >>> 24;
					here_op = here >>> 16 & 255;
					here_val = here & 65535;
					if (here_bits <= bits) break;
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (here_val < 16) {
					hold >>>= here_bits;
					bits -= here_bits;
					state.lens[state.have++] = here_val;
				} else {
					if (here_val === 16) {
						n = here_bits + 2;
						while (bits < n) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						hold >>>= here_bits;
						bits -= here_bits;
						if (state.have === 0) {
							strm.msg = "invalid bit length repeat";
							state.mode = BAD;
							break;
						}
						len = state.lens[state.have - 1];
						copy = 3 + (hold & 3);
						hold >>>= 2;
						bits -= 2;
					} else if (here_val === 17) {
						n = here_bits + 3;
						while (bits < n) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						hold >>>= here_bits;
						bits -= here_bits;
						len = 0;
						copy = 3 + (hold & 7);
						hold >>>= 3;
						bits -= 3;
					} else {
						n = here_bits + 7;
						while (bits < n) {
							if (have === 0) break inf_leave;
							have--;
							hold += input[next++] << bits;
							bits += 8;
						}
						hold >>>= here_bits;
						bits -= here_bits;
						len = 0;
						copy = 11 + (hold & 127);
						hold >>>= 7;
						bits -= 7;
					}
					if (state.have + copy > state.nlen + state.ndist) {
						strm.msg = "invalid bit length repeat";
						state.mode = BAD;
						break;
					}
					while (copy--) state.lens[state.have++] = len;
				}
			}
			if (state.mode === BAD) break;
			if (state.lens[256] === 0) {
				strm.msg = "invalid code -- missing end-of-block";
				state.mode = BAD;
				break;
			}
			state.lenbits = 9;
			opts = { bits: state.lenbits };
			ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
			state.lenbits = opts.bits;
			if (ret) {
				strm.msg = "invalid literal/lengths set";
				state.mode = BAD;
				break;
			}
			state.distbits = 6;
			state.distcode = state.distdyn;
			opts = { bits: state.distbits };
			ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
			state.distbits = opts.bits;
			if (ret) {
				strm.msg = "invalid distances set";
				state.mode = BAD;
				break;
			}
			state.mode = LEN_;
			if (flush === Z_TREES) break inf_leave;
		case LEN_: state.mode = LEN;
		case LEN:
			if (have >= 6 && left >= 258) {
				strm.next_out = put;
				strm.avail_out = left;
				strm.next_in = next;
				strm.avail_in = have;
				state.hold = hold;
				state.bits = bits;
				inffast(strm, _out);
				put = strm.next_out;
				output = strm.output;
				left = strm.avail_out;
				next = strm.next_in;
				input = strm.input;
				have = strm.avail_in;
				hold = state.hold;
				bits = state.bits;
				if (state.mode === TYPE) state.back = -1;
				break;
			}
			state.back = 0;
			for (;;) {
				here = state.lencode[hold & (1 << state.lenbits) - 1];
				here_bits = here >>> 24;
				here_op = here >>> 16 & 255;
				here_val = here & 65535;
				if (here_bits <= bits) break;
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if (here_op && (here_op & 240) === 0) {
				last_bits = here_bits;
				last_op = here_op;
				last_val = here_val;
				for (;;) {
					here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
					here_bits = here >>> 24;
					here_op = here >>> 16 & 255;
					here_val = here & 65535;
					if (last_bits + here_bits <= bits) break;
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				hold >>>= last_bits;
				bits -= last_bits;
				state.back += last_bits;
			}
			hold >>>= here_bits;
			bits -= here_bits;
			state.back += here_bits;
			state.length = here_val;
			if (here_op === 0) {
				state.mode = LIT;
				break;
			}
			if (here_op & 32) {
				state.back = -1;
				state.mode = TYPE;
				break;
			}
			if (here_op & 64) {
				strm.msg = "invalid literal/length code";
				state.mode = BAD;
				break;
			}
			state.extra = here_op & 15;
			state.mode = LENEXT;
		case LENEXT:
			if (state.extra) {
				n = state.extra;
				while (bits < n) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.length += hold & (1 << state.extra) - 1;
				hold >>>= state.extra;
				bits -= state.extra;
				state.back += state.extra;
			}
			state.was = state.length;
			state.mode = DIST;
		case DIST:
			for (;;) {
				here = state.distcode[hold & (1 << state.distbits) - 1];
				here_bits = here >>> 24;
				here_op = here >>> 16 & 255;
				here_val = here & 65535;
				if (here_bits <= bits) break;
				if (have === 0) break inf_leave;
				have--;
				hold += input[next++] << bits;
				bits += 8;
			}
			if ((here_op & 240) === 0) {
				last_bits = here_bits;
				last_op = here_op;
				last_val = here_val;
				for (;;) {
					here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
					here_bits = here >>> 24;
					here_op = here >>> 16 & 255;
					here_val = here & 65535;
					if (last_bits + here_bits <= bits) break;
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				hold >>>= last_bits;
				bits -= last_bits;
				state.back += last_bits;
			}
			hold >>>= here_bits;
			bits -= here_bits;
			state.back += here_bits;
			if (here_op & 64) {
				strm.msg = "invalid distance code";
				state.mode = BAD;
				break;
			}
			state.offset = here_val;
			state.extra = here_op & 15;
			state.mode = DISTEXT;
		case DISTEXT:
			if (state.extra) {
				n = state.extra;
				while (bits < n) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.offset += hold & (1 << state.extra) - 1;
				hold >>>= state.extra;
				bits -= state.extra;
				state.back += state.extra;
			}
			if (state.offset > state.dmax) {
				strm.msg = "invalid distance too far back";
				state.mode = BAD;
				break;
			}
			state.mode = MATCH;
		case MATCH:
			if (left === 0) break inf_leave;
			copy = _out - left;
			if (state.offset > copy) {
				copy = state.offset - copy;
				if (copy > state.whave) {
					if (state.sane) {
						strm.msg = "invalid distance too far back";
						state.mode = BAD;
						break;
					}
				}
				if (copy > state.wnext) {
					copy -= state.wnext;
					from = state.wsize - copy;
				} else from = state.wnext - copy;
				if (copy > state.length) copy = state.length;
				from_source = state.window;
			} else {
				from_source = output;
				from = put - state.offset;
				copy = state.length;
			}
			if (copy > left) copy = left;
			left -= copy;
			state.length -= copy;
			do
				output[put++] = from_source[from++];
			while (--copy);
			if (state.length === 0) state.mode = LEN;
			break;
		case LIT:
			if (left === 0) break inf_leave;
			output[put++] = state.length;
			left--;
			state.mode = LEN;
			break;
		case CHECK:
			if (state.wrap) {
				while (bits < 32) {
					if (have === 0) break inf_leave;
					have--;
					hold |= input[next++] << bits;
					bits += 8;
				}
				_out -= left;
				strm.total_out += _out;
				state.total += _out;
				if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
				_out = left;
				if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
					strm.msg = "incorrect data check";
					state.mode = BAD;
					break;
				}
				hold = 0;
				bits = 0;
			}
			state.mode = LENGTH;
		case LENGTH:
			if (state.wrap && state.flags) {
				while (bits < 32) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
					strm.msg = "incorrect length check";
					state.mode = BAD;
					break;
				}
				hold = 0;
				bits = 0;
			}
			state.mode = DONE;
		case DONE:
			ret = Z_STREAM_END$1;
			break inf_leave;
		case BAD:
			ret = Z_DATA_ERROR$1;
			break inf_leave;
		case MEM: return Z_MEM_ERROR$1;
		case SYNC:
		default: return Z_STREAM_ERROR$1;
	}
	strm.next_out = put;
	strm.avail_out = left;
	strm.next_in = next;
	strm.avail_in = have;
	state.hold = hold;
	state.bits = bits;
	if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH$1)) {
		if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out));
	}
	_in -= strm.avail_in;
	_out -= strm.avail_out;
	strm.total_in += _in;
	strm.total_out += _out;
	state.total += _out;
	if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
	strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
	if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) ret = Z_BUF_ERROR;
	return ret;
};
var inflateEnd = (strm) => {
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	let state = strm.state;
	if (state.window) state.window = null;
	strm.state = null;
	return Z_OK$1;
};
var inflateGetHeader = (strm, head) => {
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	const state = strm.state;
	if ((state.wrap & 2) === 0) return Z_STREAM_ERROR$1;
	state.head = head;
	head.done = false;
	return Z_OK$1;
};
var inflateSetDictionary = (strm, dictionary) => {
	const dictLength = dictionary.length;
	let state;
	let dictid;
	let ret;
	if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
	state = strm.state;
	if (state.wrap !== 0 && state.mode !== DICT) return Z_STREAM_ERROR$1;
	if (state.mode === DICT) {
		dictid = 1;
		dictid = adler32_1(dictid, dictionary, dictLength, 0);
		if (dictid !== state.check) return Z_DATA_ERROR$1;
	}
	ret = updatewindow(strm, dictionary, dictLength, dictLength);
	if (ret) {
		state.mode = MEM;
		return Z_MEM_ERROR$1;
	}
	state.havedict = 1;
	return Z_OK$1;
};
var inflate_1$2 = {
	inflateReset,
	inflateReset2,
	inflateResetKeep,
	inflateInit,
	inflateInit2,
	inflate: inflate$2,
	inflateEnd,
	inflateGetHeader,
	inflateSetDictionary,
	inflateInfo: "pako inflate (from Nodeca project)"
};
function GZheader() {
	this.text = 0;
	this.time = 0;
	this.xflags = 0;
	this.os = 0;
	this.extra = null;
	this.extra_len = 0;
	this.name = "";
	this.comment = "";
	this.hcrc = 0;
	this.done = false;
}
var gzheader = GZheader;
var toString = Object.prototype.toString;
var { Z_NO_FLUSH, Z_FINISH, Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR } = constants$2;
/**
* class Inflate
*
* Generic JS-style wrapper for zlib calls. If you don't need
* streaming behaviour - use more simple functions: [[inflate]]
* and [[inflateRaw]].
**/
/**
* Inflate.result -> Uint8Array|String
*
* Uncompressed result, generated by default [[Inflate#onData]]
* and [[Inflate#onEnd]] handlers. Filled after you push last chunk
* (call [[Inflate#push]] with `Z_FINISH` / `true` param).
**/
/**
* Inflate.err -> Number
*
* Error code after inflate finished. 0 (Z_OK) on success.
* Should be checked if broken data possible.
**/
/**
* Inflate.msg -> String
*
* Error message, if [[Inflate.err]] != 0
**/
/**
* new Inflate(options)
* - options (Object): zlib inflate options.
*
* Creates new inflator instance with specified params. Throws exception
* on bad params. Supported options:
*
* - `windowBits`
* - `dictionary`
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* Additional options, for internal needs:
*
* - `chunkSize` - size of generated data chunks (16K by default)
* - `raw` (Boolean) - do raw inflate
* - `to` (String) - if equal to 'string', then result will be converted
*   from utf8 to utf16 (javascript) string. When string output requested,
*   chunk length can differ from `chunkSize`, depending on content.
*
* By default, when no options set, autodetect deflate/gzip data format via
* wrapper header.
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
* const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
* const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
*
* const inflate = new pako.Inflate({ level: 3});
*
* inflate.push(chunk1, false);
* inflate.push(chunk2, true);  // true -> last chunk
*
* if (inflate.err) { throw new Error(inflate.err); }
*
* console.log(inflate.result);
* ```
**/
function Inflate$1(options) {
	this.options = common.assign({
		chunkSize: 1024 * 64,
		windowBits: 15,
		to: ""
	}, options || {});
	const opt = this.options;
	if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
		opt.windowBits = -opt.windowBits;
		if (opt.windowBits === 0) opt.windowBits = -15;
	}
	if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) opt.windowBits += 32;
	if (opt.windowBits > 15 && opt.windowBits < 48) {
		if ((opt.windowBits & 15) === 0) opt.windowBits |= 15;
	}
	this.err = 0;
	this.msg = "";
	this.ended = false;
	this.chunks = [];
	this.strm = new zstream();
	this.strm.avail_out = 0;
	let status = inflate_1$2.inflateInit2(this.strm, opt.windowBits);
	if (status !== Z_OK) throw new Error(messages[status]);
	this.header = new gzheader();
	inflate_1$2.inflateGetHeader(this.strm, this.header);
	if (opt.dictionary) {
		if (typeof opt.dictionary === "string") opt.dictionary = strings.string2buf(opt.dictionary);
		else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") opt.dictionary = new Uint8Array(opt.dictionary);
		if (opt.raw) {
			status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
			if (status !== Z_OK) throw new Error(messages[status]);
		}
	}
}
/**
* Inflate#push(data[, flush_mode]) -> Boolean
* - data (Uint8Array|ArrayBuffer): input data
* - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
*   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
*   `true` means Z_FINISH.
*
* Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
* new output chunks. Returns `true` on success. If end of stream detected,
* [[Inflate#onEnd]] will be called.
*
* `flush_mode` is not needed for normal operation, because end of stream
* detected automatically. You may try to use it for advanced things, but
* this functionality was not tested.
*
* On fail call [[Inflate#onEnd]] with error code and return false.
*
* ##### Example
*
* ```javascript
* push(chunk, false); // push one of data chunks
* ...
* push(chunk, true);  // push last chunk
* ```
**/
Inflate$1.prototype.push = function(data, flush_mode) {
	const strm = this.strm;
	const chunkSize = this.options.chunkSize;
	const dictionary = this.options.dictionary;
	let status, _flush_mode, last_avail_out;
	if (this.ended) return false;
	if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
	else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
	if (toString.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
	else strm.input = data;
	strm.next_in = 0;
	strm.avail_in = strm.input.length;
	for (;;) {
		if (strm.avail_out === 0) {
			strm.output = new Uint8Array(chunkSize);
			strm.next_out = 0;
			strm.avail_out = chunkSize;
		}
		status = inflate_1$2.inflate(strm, _flush_mode);
		if (status === Z_NEED_DICT && dictionary) {
			status = inflate_1$2.inflateSetDictionary(strm, dictionary);
			if (status === Z_OK) status = inflate_1$2.inflate(strm, _flush_mode);
			else if (status === Z_DATA_ERROR) status = Z_NEED_DICT;
		}
		while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
			inflate_1$2.inflateReset(strm);
			status = inflate_1$2.inflate(strm, _flush_mode);
		}
		switch (status) {
			case Z_STREAM_ERROR:
			case Z_DATA_ERROR:
			case Z_NEED_DICT:
			case Z_MEM_ERROR:
				this.onEnd(status);
				this.ended = true;
				return false;
		}
		last_avail_out = strm.avail_out;
		if (strm.next_out) {
			if (strm.avail_out === 0 || status === Z_STREAM_END) if (this.options.to === "string") {
				let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
				let tail = strm.next_out - next_out_utf8;
				let utf8str = strings.buf2string(strm.output, next_out_utf8);
				strm.next_out = tail;
				strm.avail_out = chunkSize - tail;
				if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
				this.onData(utf8str);
			} else this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
		}
		if (status === Z_OK && last_avail_out === 0) continue;
		if (status === Z_STREAM_END) {
			status = inflate_1$2.inflateEnd(this.strm);
			this.onEnd(status);
			this.ended = true;
			return true;
		}
		if (strm.avail_in === 0) break;
	}
	return true;
};
/**
* Inflate#onData(chunk) -> Void
* - chunk (Uint8Array|String): output data. When string output requested,
*   each chunk will be string.
*
* By default, stores data blocks in `chunks[]` property and glue
* those in `onEnd`. Override this handler, if you need another behaviour.
**/
Inflate$1.prototype.onData = function(chunk) {
	this.chunks.push(chunk);
};
/**
* Inflate#onEnd(status) -> Void
* - status (Number): inflate status. 0 (Z_OK) on success,
*   other if not.
*
* Called either after you tell inflate that the input stream is
* complete (Z_FINISH). By default - join collected chunks,
* free memory and fill `results` / `err` properties.
**/
Inflate$1.prototype.onEnd = function(status) {
	if (status === Z_OK) if (this.options.to === "string") this.result = this.chunks.join("");
	else this.result = common.flattenChunks(this.chunks);
	this.chunks = [];
	this.err = status;
	this.msg = this.strm.msg;
};
/**
* inflate(data[, options]) -> Uint8Array|String
* - data (Uint8Array|ArrayBuffer): input data to decompress.
* - options (Object): zlib inflate options.
*
* Decompress `data` with inflate/ungzip and `options`. Autodetect
* format via wrapper header by default. That's why we don't provide
* separate `ungzip` method.
*
* Supported options are:
*
* - windowBits
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information.
*
* Sugar (options):
*
* - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
*   negative windowBits implicitly.
* - `to` (String) - if equal to 'string', then result will be converted
*   from utf8 to utf16 (javascript) string. When string output requested,
*   chunk length can differ from `chunkSize`, depending on content.
*
*
* ##### Example:
*
* ```javascript
* const pako = require('pako');
* const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
* let output;
*
* try {
*   output = pako.inflate(input);
* } catch (err) {
*   console.log(err);
* }
* ```
**/
function inflate$1(input, options) {
	const inflator = new Inflate$1(options);
	inflator.push(input);
	if (inflator.err) throw inflator.msg || messages[inflator.err];
	return inflator.result;
}
/**
* inflateRaw(data[, options]) -> Uint8Array|String
* - data (Uint8Array|ArrayBuffer): input data to decompress.
* - options (Object): zlib inflate options.
*
* The same as [[inflate]], but creates raw data, without wrapper
* (header and adler32 crc).
**/
function inflateRaw$1(input, options) {
	options = options || {};
	options.raw = true;
	return inflate$1(input, options);
}
var inflate_1$1 = {
	Inflate: Inflate$1,
	inflate: inflate$1,
	inflateRaw: inflateRaw$1,
	ungzip: inflate$1,
	constants: constants$2
};
var { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;
var { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;
var pako = {
	Deflate,
	deflate,
	deflateRaw,
	gzip,
	Inflate,
	inflate,
	inflateRaw,
	ungzip,
	constants: constants$2
};
//#endregion
//#region src/services/compressionService.js
var CompressionService = class {
	constructor() {
		this.compressionThreshold = 1024;
		this.compressionLevel = 6;
	}
	/**
	* 检查是否支持压缩
	*/
	isCompressionSupported() {
		return typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined" && typeof CompressionStream !== "undefined";
	}
	/**
	* 压缩数据
	* @param {any} data - 要压缩的数据（对象会被转为JSON）
	* @returns {Uint8Array|string} - 压缩后的数据
	*/
	compress(data) {
		try {
			const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
			if (jsonStr.length < this.compressionThreshold) return jsonStr;
			const uint8Array = new TextEncoder().encode(jsonStr);
			return pako.deflate(uint8Array, { level: this.compressionLevel });
		} catch (error) {
			console.error("[Compression] Compress failed:", error);
			return typeof data === "string" ? data : JSON.stringify(data);
		}
	}
	/**
	* 解压数据
	* @param {Uint8Array|string} data - 压缩的数据
	* @returns {any} - 解压后的数据
	*/
	decompress(data) {
		try {
			if (typeof data === "string") return JSON.parse(data);
			const decompressed = pako.inflate(data, { to: "string" });
			return JSON.parse(decompressed);
		} catch (error) {
			try {
				if (typeof data === "string") return JSON.parse(data);
				const jsonStr = new TextDecoder().decode(data);
				return JSON.parse(jsonStr);
			} catch (e) {
				console.error("[Compression] Decompress failed:", e);
				return null;
			}
		}
	}
	/**
	* 压缩并编码为Base64（用于存储或传输）
	* @param {any} data - 要压缩的数据
	* @returns {string} - Base64编码的压缩数据
	*/
	compressToBase64(data) {
		try {
			const compressed = this.compress(data);
			if (typeof compressed === "string") return btoa(encodeURIComponent(compressed));
			let binary = "";
			for (let i = 0; i < compressed.length; i++) binary += String.fromCharCode(compressed[i]);
			return btoa(binary);
		} catch (error) {
			console.error("[Compression] Compress to base64 failed:", error);
			return null;
		}
	}
	/**
	* 从Base64解压
	* @param {string} base64 - Base64编码的压缩数据
	* @returns {any} - 解压后的数据
	*/
	decompressFromBase64(base64) {
		try {
			const binary = atob(base64);
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
			return this.decompress(bytes);
		} catch (error) {
			try {
				const decoded = decodeURIComponent(atob(base64));
				return JSON.parse(decoded);
			} catch (e) {
				console.error("[Compression] Decompress from base64 failed:", e);
				return null;
			}
		}
	}
	/**
	* 获取压缩统计信息
	*/
	getCompressionStats(originalSize, compressedSize) {
		return {
			originalSize,
			compressedSize,
			savedBytes: originalSize - compressedSize,
			compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(2) + "%"
		};
	}
};
var compressionService = new CompressionService();
//#endregion
//#region src/services/offlineStorage.js
var DB_NAME = "gold_monitor_db";
var STORE_NAME = "price_history";
var META_STORE = "cache_meta";
var MAX_RECORDS_PER_SOURCE = 500;
var DATA_EXPIRY = 1800 * 1e3;
var CLEANUP_INTERVAL = 300 * 1e3;
var COMPRESSION_THRESHOLD = 512;
var OfflineStorage = class {
	constructor() {
		this.db = null;
		this.isReady = false;
		this.initPromise = this.init();
		this.cleanupTimer = null;
		this.stats = {
			hits: 0,
			misses: 0,
			writes: 0,
			cleanups: 0
		};
	}
	async init() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, 3);
			request.onerror = () => reject(/* @__PURE__ */ new Error("Failed to open database"));
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
					store.createIndex("source", "source", { unique: false });
					store.createIndex("timestamp", "timestamp", { unique: false });
				}
				if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "key" });
			};
			request.onsuccess = (event) => {
				this.db = event.target.result;
				this.isReady = true;
				this.startPeriodicCleanup();
				resolve();
			};
		});
	}
	startPeriodicCleanup() {
		if (this.cleanupTimer) return;
		this.cleanupTimer = setInterval(async () => {
			try {
				if (await this.cleanExpiredData() > 0) this.stats.cleanups++;
			} catch (e) {
				console.warn("[OfflineStorage] Periodic cleanup failed:", e);
			}
		}, CLEANUP_INTERVAL);
	}
	stopPeriodicCleanup() {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}
	}
	compressData(data) {
		if (JSON.stringify(data).length < COMPRESSION_THRESHOLD) return {
			data,
			compressed: false
		};
		try {
			return {
				data: compressionService.compress(data),
				compressed: true
			};
		} catch (e) {
			console.warn("[OfflineStorage] Compression failed, storing raw:", e);
			return {
				data,
				compressed: false
			};
		}
	}
	decompressData(record) {
		if (!record.compressed) return record.data;
		try {
			return compressionService.decompress(record.data);
		} catch (e) {
			console.warn("[OfflineStorage] Decompression failed:", e);
			return null;
		}
	}
	async savePriceData(source, data) {
		await this.initPromise;
		this.stats.writes++;
		return new Promise((resolve, reject) => {
			try {
				const transaction = this.db.transaction(STORE_NAME, "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const newRecord = {
					id: `${source}_${Date.now()}`,
					source,
					timestamp: Date.now(),
					compressed: false
				};
				const rawData = {
					price: data.current,
					prevClose: data.prevClose,
					change: data.change,
					changePercent: data.changePercent,
					currency: data.currency
				};
				const { data: compressedData, compressed } = this.compressData(rawData);
				newRecord.data = compressedData;
				newRecord.compressed = compressed;
				if (!compressed) {
					newRecord.price = data.current;
					newRecord.prevClose = data.prevClose;
					newRecord.change = data.change;
					newRecord.changePercent = data.changePercent;
					newRecord.currency = data.currency;
				}
				store.put(newRecord);
				const index = store.index("source");
				const countReq = index.count(IDBKeyRange.only(source));
				countReq.onsuccess = () => {
					const total = countReq.result;
					if (total > MAX_RECORDS_PER_SOURCE) {
						const toDelete = total - MAX_RECORDS_PER_SOURCE;
						let deleted = 0;
						const cursorReq = index.openCursor(IDBKeyRange.only(source));
						cursorReq.onsuccess = (event) => {
							const cursor = event.target.result;
							if (cursor && deleted < toDelete) {
								cursor.delete();
								deleted++;
								cursor.continue();
							}
						};
						cursorReq.onerror = () => {
							console.warn("[OfflineStorage] Cleanup cursor failed");
						};
					}
				};
				countReq.onerror = () => {
					console.warn("[OfflineStorage] Count request failed, skipping cleanup");
				};
				transaction.oncomplete = () => resolve();
				transaction.onerror = () => reject(/* @__PURE__ */ new Error("Transaction failed"));
			} catch (error) {
				reject(error);
			}
		});
	}
	async getHistoryData(source, limit = 100) {
		await this.initPromise;
		return new Promise((resolve, reject) => {
			const index = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("source");
			const minTimestamp = Date.now() - DATA_EXPIRY;
			const records = [];
			const cursorReq = index.openCursor(IDBKeyRange.only(source));
			cursorReq.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					const record = cursor.value;
					if (record.timestamp >= minTimestamp) if (record.compressed && record.data) {
						const data = this.decompressData(record);
						if (data) records.push({
							...record,
							...data
						});
					} else records.push(record);
					cursor.continue();
				} else {
					records.sort((a, b) => a.timestamp - b.timestamp);
					this.stats.hits++;
					resolve(records.slice(-limit));
				}
			};
			cursorReq.onerror = () => {
				this.stats.misses++;
				reject(/* @__PURE__ */ new Error("Failed to get records"));
			};
		});
	}
	async getLatestPrices() {
		await this.initPromise;
		return new Promise((resolve, reject) => {
			const index = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).index("source");
			const latestData = {};
			const sourceTimestamps = {};
			const cursorReq = index.openCursor();
			cursorReq.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					const record = cursor.value;
					const source = record.source;
					if (!sourceTimestamps[source] || record.timestamp > sourceTimestamps[source]) {
						sourceTimestamps[source] = record.timestamp;
						let data = record;
						if (record.compressed && record.data) {
							const decompressed = this.decompressData(record);
							if (decompressed) data = {
								...record,
								...decompressed
							};
						}
						latestData[source] = {
							price: data.price,
							timestamp: data.timestamp,
							prevClose: data.prevClose,
							change: data.change,
							changePercent: data.changePercent,
							currency: data.currency
						};
					}
					cursor.continue();
				} else {
					this.stats.hits++;
					resolve(latestData);
				}
			};
			cursorReq.onerror = () => {
				this.stats.misses++;
				reject(/* @__PURE__ */ new Error("Failed to get records"));
			};
		});
	}
	async cleanExpiredData() {
		await this.initPromise;
		return new Promise((resolve, reject) => {
			const index = this.db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).index("timestamp");
			const expiryThreshold = Date.now() - DATA_EXPIRY;
			let expiredCount = 0;
			const cursorReq = index.openCursor(IDBKeyRange.upperBound(expiryThreshold));
			cursorReq.onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					cursor.delete();
					expiredCount++;
					cursor.continue();
				} else {
					if (expiredCount > 0) {}
					resolve(expiredCount);
				}
			};
			cursorReq.onerror = () => reject(/* @__PURE__ */ new Error("Failed to clean expired data"));
		});
	}
	async getStatus() {
		await this.initPromise;
		return new Promise((resolve, reject) => {
			const countRequest = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
			countRequest.onsuccess = () => {
				resolve({
					isReady: this.isReady,
					totalRecords: countRequest.result,
					lastUpdated: Date.now(),
					stats: { ...this.stats },
					config: {
						maxRecordsPerSource: MAX_RECORDS_PER_SOURCE,
						dataExpiry: DATA_EXPIRY,
						compressionThreshold: COMPRESSION_THRESHOLD
					}
				});
			};
			countRequest.onerror = () => reject(/* @__PURE__ */ new Error("Failed to count records"));
		});
	}
	getStats() {
		return {
			...this.stats,
			hitRate: this.stats.hits + this.stats.misses > 0 ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + "%" : "0%"
		};
	}
	resetStats() {
		this.stats = {
			hits: 0,
			misses: 0,
			writes: 0,
			cleanups: 0
		};
	}
	async clearAll() {
		await this.initPromise;
		return new Promise((resolve, reject) => {
			const clearRequest = this.db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear();
			clearRequest.onsuccess = () => {
				resolve();
			};
			clearRequest.onerror = () => reject(/* @__PURE__ */ new Error("Failed to clear store"));
		});
	}
};
var offlineStorage = new OfflineStorage();
//#endregion
//#region src/services/dataRecovery.js
var DataRecovery = class {
	constructor() {
		this.lastSyncTime = 0;
		this.isRecovering = false;
		this.syncKey = "gold_last_sync";
		try {
			const lastSync = localStorage.getItem(this.syncKey);
			if (lastSync) this.lastSyncTime = parseInt(lastSync);
		} catch (e) {
			this.lastSyncTime = 0;
		}
	}
	recordSync() {
		this.lastSyncTime = Date.now();
		localStorage.setItem(this.syncKey, this.lastSyncTime.toString());
	}
	async startRecovery(fetchFunction) {
		if (this.isRecovering) return;
		this.isRecovering = true;
		try {
			const offlineData = await offlineStorage.getLatestPrices();
			const networkData = await fetchFunction();
			const mergedData = this.mergeData(offlineData, networkData);
			await offlineStorage.cleanExpiredData();
			this.recordSync();
			return mergedData;
		} catch (error) {
			console.error("[DataRecovery] Recovery failed:", error);
			throw error;
		} finally {
			this.isRecovering = false;
		}
	}
	mergeData(offlineData, networkData) {
		const merged = { ...networkData };
		for (const source of Object.keys(offlineData)) if (!merged[source] || !merged[source].current) {
			const offlinePrice = offlineData[source];
			if (offlinePrice && offlinePrice.price > 0) merged[source] = {
				current: offlinePrice.price,
				prevClose: offlinePrice.prevClose || 0,
				change: offlinePrice.change || 0,
				changePercent: offlinePrice.changePercent || 0,
				currency: offlinePrice.currency || "CNY",
				timestamp: offlinePrice.timestamp,
				isOffline: true
			};
		}
		return merged;
	}
	getRecoveryStatus() {
		return {
			isRecovering: this.isRecovering,
			lastSync: this.lastSyncTime,
			offlineSince: this.lastSyncTime > 0 ? Date.now() - this.lastSyncTime : 0
		};
	}
};
var dataRecovery = new DataRecovery();
//#endregion
//#region src/services/networkService.js
var NetworkService = class {
	constructor() {
		this.isOnline = navigator.onLine;
		this.listeners = /* @__PURE__ */ new Set();
		this.lastOnlineTime = this.isOnline ? Date.now() : 0;
		this.lastOfflineTime = !this.isOnline ? Date.now() : 0;
		this.offlineDuration = 0;
		this.init();
	}
	init() {
		window.addEventListener("online", () => this.handleOnline());
		window.addEventListener("offline", () => this.handleOffline());
	}
	handleOnline() {
		const wasOffline = !this.isOnline;
		this.isOnline = true;
		this.lastOnlineTime = Date.now();
		if (wasOffline) this.offlineDuration = this.lastOnlineTime - this.lastOfflineTime;
		this.notifyListeners({
			isOnline: true,
			wasOffline,
			offlineDuration: this.offlineDuration
		});
	}
	handleOffline() {
		const wasOnline = this.isOnline;
		this.isOnline = false;
		this.lastOfflineTime = Date.now();
		if (wasOnline) {}
		this.notifyListeners({
			isOnline: false,
			wasOnline,
			offlineDuration: 0
		});
	}
	subscribe(callback) {
		this.listeners.add(callback);
		callback({
			isOnline: this.isOnline,
			wasOffline: false,
			offlineDuration: 0
		});
		return () => {
			this.listeners.delete(callback);
		};
	}
	notifyListeners(status) {
		this.listeners.forEach((callback) => {
			try {
				callback(status);
			} catch (e) {
				console.error("[Network] Listener error:", e);
			}
		});
	}
	getStatus() {
		return {
			isOnline: this.isOnline,
			lastOnlineTime: this.lastOnlineTime,
			lastOfflineTime: this.lastOfflineTime,
			offlineDuration: this.offlineDuration,
			connectionType: navigator.connection?.effectiveType || "unknown",
			downlink: navigator.connection?.downlink || null
		};
	}
	wasOfflineFor(ms) {
		return this.offlineDuration >= ms;
	}
};
var networkService = new NetworkService();
//#endregion
//#region src/stores/goldStore.js
var SMART_POLLING = {
	intervals: REFRESH_INTERVALS,
	thresholds: {
		activeToNormal: 6e4,
		normalToCalm: 12e4,
		calmToInactive: 3e5
	}
};
var httpPollingTimer = null;
var pendingRequest = null;
var lastRequestTime = 0;
var REQUEST_DEDUP_INTERVAL = 1e3;
var lastDataChangeTime = Date.now();
var currentPollingMode = "active";
var subscribeSetup = false;
var loadHistoryFromStorage = () => {
	try {
		const stored = localStorage.getItem("gold-history-data");
		if (stored) {
			const data = JSON.parse(stored);
			if (data.timestamp && Date.now() - data.timestamp < 18e5) {
				const history = data.history || {};
				const now = Date.now();
				let hasValidData = false;
				for (const key in history) if (Array.isArray(history[key])) {
					history[key] = history[key].filter((item) => item.price > 0 && now - item.timestamp < 18e5);
					const prices = history[key].map((h) => h.price);
					if ([...new Set(prices)].length >= 2) hasValidData = true;
					else if (prices.length > 0) history[key] = [];
				}
				if (!hasValidData) return {};
				return history;
			}
		}
	} catch (e) {
		console.warn("Failed to load history from storage:", e);
		localStorage.removeItem("gold-history-data");
	}
	return {};
};
var saveHistoryToStorage = (historyData) => {
	try {
		localStorage.setItem("gold-history-data", JSON.stringify({
			timestamp: Date.now(),
			history: historyData
		}));
	} catch (e) {
		console.warn("Failed to save history to storage:", e);
	}
};
var initialHistory = loadHistoryFromStorage();
var useGoldStore = defineStore("gold", {
	state: () => ({
		dataSource: localStorage.getItem("dataSource") || "sina",
		au9999: {
			name: "Au9999",
			symbol: "AU9999",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "CNY",
			history: initialHistory.au9999 || []
		},
		usFutures: {
			name: "美国期货",
			symbol: "GC",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "USD",
			history: initialHistory.usFutures || []
		},
		ukFutures: {
			name: "伦敦金",
			symbol: "XAU",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "USD",
			history: initialHistory.ukFutures || []
		},
		usdCny: {
			name: "人民币汇率",
			symbol: "USD/CNY",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "RATE",
			history: initialHistory.usdCny || []
		},
		dxy: {
			name: "美元指数",
			symbol: "DXY",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "INDEX",
			history: initialHistory.dxy || []
		},
		paxg: {
			name: "国际暗金",
			symbol: "PAXG",
			current: 0,
			prevClose: 0,
			change: 0,
			changePercent: 0,
			currency: "USD",
			history: initialHistory.paxg || []
		},
		lastUpdate: null,
		isLoading: false,
		error: null,
		wsConnected: false,
		wsReconnecting: false,
		useWebSocket: true,
		priceFlash: {
			au9999: false,
			usFutures: false,
			ukFutures: false,
			usdCny: false,
			dxy: false,
			paxg: false
		},
		syncStatus: "offline",
		syncStats: {
			recordCount: 0,
			lastUpdate: null,
			latency: "--"
		},
		isOfflineMode: false,
		lastFetchTime: null,
		pollingMode: "active",
		networkStatus: {
			isOnline: navigator.onLine,
			connectionType: "unknown",
			offlineDuration: 0
		},
		sourceStatus: {
			sina: "ok",
			eastmoney: "ok",
			gate: "ok"
		}
	}),
	getters: {
		formattedLastUpdate: (state) => {
			if (!state.lastUpdate) return "--";
			return new Date(state.lastUpdate).toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		},
		showOfflineWarning: (state) => {
			return state.syncStatus === "offline" || state.syncStatus === "error";
		},
		healthySourceCount: (state) => {
			return Object.values(state.sourceStatus).filter((s) => s === "ok").length;
		}
	},
	actions: {
		async saveToOfflineStorage(key, data) {
			try {
				const source = {
					au9999: "au9999",
					usFutures: "usFutures",
					ukFutures: "ukFutures",
					usdCny: "usdCny",
					dxy: "dxy",
					paxg: "paxg"
				}[key];
				if (source && data.current > 0) await offlineStorage.savePriceData(source, data);
			} catch (error) {
				console.warn(`[Store] Failed to save ${key} to offline storage:`, error);
			}
		},
		updateSyncStatus(status, latency = null) {
			this.syncStatus = status;
			if (latency !== null) this.syncStats.latency = latency;
			this.isOfflineMode = status === "offline" || status === "error";
		},
		async recoverFromOffline() {
			try {
				const offlineData = await offlineStorage.getLatestPrices();
				for (const [source, key] of Object.entries({
					au9999: "au9999",
					usFutures: "usFutures",
					ukFutures: "ukFutures",
					usdCny: "usdCny",
					dxy: "dxy",
					paxg: "paxg"
				})) if (offlineData[source] && offlineData[source].price > 0) {
					const data = offlineData[source];
					this[key] = {
						...this[key],
						current: data.price,
						prevClose: data.prevClose || this[key].prevClose,
						change: data.change || 0,
						changePercent: data.changePercent || 0,
						currency: data.currency || this[key].currency
					};
				}
				this.lastUpdate = Date.now();
			} catch (error) {
				console.error("[Store] Offline recovery failed:", error);
			}
		},
		async updateCacheStats() {
			try {
				const status = await offlineStorage.getStatus();
				this.syncStats.recordCount = status.totalRecords;
			} catch (error) {
				console.warn("[Store] Failed to update cache stats:", error);
			}
		},
		updateSourceStatus(source, status) {
			if (this.sourceStatus[source] !== void 0) this.sourceStatus[source] = status;
		},
		updateAllSourceStatus(data) {
			const sinaOk = data.au9999?.current > 0 || data.ukFutures?.current > 0 || data.usdCny?.current > 0 || data.dxy?.current > 0;
			this.updateSourceStatus("sina", sinaOk ? "ok" : "error");
			const gateOk = data.paxg?.current > 0;
			this.updateSourceStatus("gate", gateOk ? "ok" : "error");
		},
		async startDataRecovery(fetchFunction) {
			try {
				return await dataRecovery.startRecovery(fetchFunction);
			} catch (error) {
				console.error("[Store] Data recovery failed:", error);
				throw error;
			}
		},
		getRecoveryStatus() {
			return dataRecovery.getRecoveryStatus();
		},
		async fetchAllData() {
			const now = Date.now();
			if (pendingRequest && now - lastRequestTime < REQUEST_DEDUP_INTERVAL) return pendingRequest;
			lastRequestTime = now;
			this.isLoading = true;
			this.error = null;
			const startTime = Date.now();
			pendingRequest = (async () => {
				try {
					const data = await fetchAllPrices();
					const latency = Date.now() - startTime;
					this.syncStats.latency = latency;
					if (data.au9999) this.updateData("au9999", data.au9999);
					if (data.usFutures) this.updateData("usFutures", data.usFutures);
					if (data.ukFutures) this.updateData("ukFutures", data.ukFutures);
					if (data.usdCny) this.updateData("usdCny", data.usdCny);
					if (data.dxy) this.updateData("dxy", data.dxy);
					if (data.paxg) this.updateData("paxg", data.paxg);
					this.updateAllSourceStatus(data);
					this.lastUpdate = Date.now();
					this.updateCacheStats();
					this.recordPriceChange();
					return data;
				} catch (error) {
					this.error = error.message || "获取数据失败";
					console.error("Store: Error fetching data:", error);
					throw error;
				} finally {
					this.isLoading = false;
					pendingRequest = null;
				}
			})();
			return pendingRequest;
		},
		updateData(key, data) {
			if (!this[key] || !data) return;
			if (this[key].current !== data.current && data.current > 0) {
				this.triggerFlash(key);
				this.recordPriceChange();
			}
			this[key] = {
				...this[key],
				...data,
				history: this.addToHistory(this[key].history, data)
			};
			this.saveToOfflineStorage(key, data);
		},
		triggerFlash(key) {
			this.priceFlash[key] = true;
			setTimeout(() => {
				this.priceFlash[key] = false;
			}, 300);
		},
		setupSubscribe() {
			if (subscribeSetup) return;
			subscribeSetup = true;
			this.$subscribe(({ storeName, events }, state) => {
				this.scheduleHistorySave();
			}, {
				detached: true,
				deep: false
			});
		},
		_historySaveTimer: null,
		scheduleHistorySave() {
			if (this._historySaveTimer) clearTimeout(this._historySaveTimer);
			this._historySaveTimer = setTimeout(() => {
				this.saveHistoryData();
				this._historySaveTimer = null;
			}, 5e3);
		},
		addToHistory(history, data) {
			const now = Date.now();
			if (!data.current || data.current <= 0) return history;
			const newEntry = {
				price: data.current,
				timestamp: data.timestamp || now
			};
			const newHistory = [...history.filter((item) => now - item.timestamp < 18e5 && item.price > 0), newEntry];
			return newHistory.length > 360 ? newHistory.slice(-360) : newHistory;
		},
		saveHistoryData() {
			saveHistoryToStorage({
				au9999: this.au9999.history,
				usFutures: this.usFutures.history,
				ukFutures: this.ukFutures.history,
				usdCny: this.usdCny.history,
				dxy: this.dxy.history,
				paxg: this.paxg.history
			});
		},
		async setDataSource(source) {
			try {
				await setDataSource(source);
				this.dataSource = source;
				localStorage.setItem("dataSource", source);
				await this.fetchAllData();
			} catch (error) {
				console.error("Error setting data source:", error);
				this.dataSource = source;
				localStorage.setItem("dataSource", source);
			}
		},
		clearHistory() {
			this.au9999.history = [];
			this.usFutures.history = [];
			this.ukFutures.history = [];
			this.usdCny.history = [];
			this.dxy.history = [];
			this.paxg.history = [];
			localStorage.removeItem("gold-history-data");
		},
		initWebSocket() {
			this.setupSubscribe();
			this.updateSyncStatus("connecting");
			this.initNetworkListener();
			wsService.on("prices", (data) => {
				this.handleWebSocketData(data);
			});
			wsService.onStatusChange((status) => {
				this.wsConnected = status.connected;
				this.wsReconnecting = status.reconnecting;
				if (status.connected) {
					this.updateSyncStatus("connected");
					dataRecovery.recordSync();
				} else if (status.reconnecting) this.updateSyncStatus("connecting");
				else {
					this.updateSyncStatus("error");
					this.startHttpPolling();
				}
				if (!status.connected && !status.reconnecting) this.startHttpPolling();
				else if (status.connected) this.stopHttpPolling();
			});
			wsService.connect().then((connected) => {
				if (!connected) {
					this.updateSyncStatus("offline");
					this.startHttpPolling();
					this.recoverFromOffline();
				}
			});
		},
		initNetworkListener() {
			networkService.subscribe((status) => {
				this.networkStatus = {
					isOnline: status.isOnline,
					connectionType: navigator.connection?.effectiveType || "unknown",
					offlineDuration: status.offlineDuration || 0
				};
				if (status.isOnline && status.wasOffline) this.handleNetworkRecovery(status.offlineDuration);
				else if (!status.isOnline) this.updateSyncStatus("offline");
			});
		},
		async handleNetworkRecovery(offlineDuration) {
			if (offlineDuration > 300 * 1e3) try {
				await this.startDataRecovery(() => this.fetchAllData());
			} catch (error) {
				console.error("[Store] Recovery failed:", error);
				await this.fetchAllData();
			}
			else await this.fetchAllData();
			if (!this.wsConnected) wsService.connect();
		},
		disconnectWebSocket() {
			wsService.disconnect();
			this.stopHttpPolling();
		},
		handleWebSocketData(data) {
			if (!data) return;
			const now = Date.now();
			if (data.au9999) this.updateData("au9999", data.au9999);
			if (data.usFutures) this.updateData("usFutures", data.usFutures);
			if (data.ukFutures) this.updateData("ukFutures", data.ukFutures);
			if (data.usdCny) this.updateData("usdCny", data.usdCny);
			if (data.dxy) this.updateData("dxy", data.dxy);
			if (data.paxg) this.updateData("paxg", data.paxg);
			this.lastUpdate = now;
			if (this.lastFetchTime) {
				const latency = now - this.lastFetchTime;
				this.syncStats.latency = Math.min(latency, 1e3);
			}
			this.lastFetchTime = now;
			this.updateCacheStats();
		},
		startHttpPolling() {
			if (httpPollingTimer) return;
			this.fetchAllData();
			const doPoll = async () => {
				if (!httpPollingTimer) return;
				await this.fetchAllData();
				this.adjustPollingMode();
				const interval = SMART_POLLING.intervals[currentPollingMode];
				httpPollingTimer = setTimeout(doPoll, interval);
			};
			httpPollingTimer = setTimeout(doPoll, SMART_POLLING.intervals.active);
		},
		adjustPollingMode() {
			const timeSinceLastChange = Date.now() - lastDataChangeTime;
			const thresholds = SMART_POLLING.thresholds;
			let newMode = currentPollingMode;
			if (timeSinceLastChange >= thresholds.calmToInactive) newMode = "inactive";
			else if (timeSinceLastChange >= thresholds.normalToCalm) newMode = "calm";
			else if (timeSinceLastChange >= thresholds.activeToNormal) newMode = "normal";
			else newMode = "active";
			if (newMode !== currentPollingMode) {
				currentPollingMode = newMode;
				this.pollingMode = newMode;
			}
		},
		recordPriceChange() {
			lastDataChangeTime = Date.now();
			if (currentPollingMode !== "active") {
				currentPollingMode = "active";
				this.pollingMode = "active";
			}
		},
		getCurrentPollingInterval() {
			return SMART_POLLING.intervals[currentPollingMode];
		},
		getCurrentPollingMode() {
			return currentPollingMode;
		},
		stopHttpPolling() {
			if (httpPollingTimer) {
				clearTimeout(httpPollingTimer);
				httpPollingTimer = null;
				currentPollingMode = "active";
				this.pollingMode = "active";
			}
		}
	}
});
//#endregion
//#region src/components/HeaderBar.vue
var _hoisted_1$12 = { class: "app-header" };
var _hoisted_2$11 = { class: "header-inner" };
var _hoisted_3$11 = { class: "header-left" };
var _hoisted_4$9 = { class: "data-source" };
var _hoisted_5$7 = { class: "header-right" };
var _hoisted_6$7 = { class: "header-actions" };
var _sfc_main$13 = {
	__name: "HeaderBar",
	props: { dataSource: {
		type: String,
		default: "sina"
	} },
	setup(__props) {
		const props = __props;
		const dataSourceName = computed(() => {
			return DATA_SOURCE_NAMES[props.dataSource] || DATA_SOURCE_NAMES.mixed;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("header", _hoisted_1$12, [createBaseVNode("div", _hoisted_2$11, [createBaseVNode("div", _hoisted_3$11, [_cache[0] || (_cache[0] = createStaticVNode("<div class=\"logo\"><div class=\"logo-icon\"><svg viewBox=\"0 0 44 44\" fill=\"none\"><defs><linearGradient id=\"brandGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#a78bfa\"></stop><stop offset=\"50%\" stop-color=\"#8b5cf6\"></stop><stop offset=\"100%\" stop-color=\"#6366f1\"></stop></linearGradient><filter id=\"glow\"><feGaussianBlur stdDeviation=\"1.5\" result=\"coloredBlur\"></feGaussianBlur><feMerge><feMergeNode in=\"coloredBlur\"></feMergeNode><feMergeNode in=\"SourceGraphic\"></feMergeNode></feMerge></filter></defs><circle cx=\"22\" cy=\"22\" r=\"20\" stroke=\"url(#brandGrad)\" stroke-width=\"2\" fill=\"none\"></circle><circle cx=\"22\" cy=\"22\" r=\"16\" stroke=\"url(#brandGrad)\" stroke-width=\"1\" fill=\"none\" opacity=\"0.3\"></circle><path d=\"M22 6L27 16L38 18L30 26L32 38L22 32L12 38L14 26L6 18L17 16L22 6Z\" fill=\"url(#brandGrad)\" filter=\"url(#glow)\"></path></svg></div><div class=\"logo-text\"><h1 class=\"app-title\">黄金看盘</h1><span class=\"app-subtitle\">GOLD MONITOR</span></div></div>", 1)), createBaseVNode("span", _hoisted_4$9, "数据来源: " + toDisplayString(dataSourceName.value), 1)]), createBaseVNode("div", _hoisted_5$7, [createBaseVNode("div", _hoisted_6$7, [renderSlot(_ctx.$slots, "actions")])])])]);
		};
	}
};
//#endregion
//#region src/components/IconArrow.vue
var _hoisted_1$11 = [
	"width",
	"height",
	"stroke-width"
];
var _sfc_main$12 = {
	__name: "IconArrow",
	props: {
		direction: {
			type: String,
			default: "up",
			validator: (v) => [
				"up",
				"down",
				"left",
				"right"
			].includes(v)
		},
		size: {
			type: [Number, String],
			default: 12
		},
		strokeWidth: {
			type: [Number, String],
			default: 2.5
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("svg", {
				width: __props.size,
				height: __props.size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": __props.strokeWidth,
				"stroke-linecap": "round",
				"stroke-linejoin": "round"
			}, [__props.direction === "up" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[0] || (_cache[0] = createBaseVNode("path", { d: "M12 19V5" }, null, -1)), _cache[1] || (_cache[1] = createBaseVNode("path", { d: "M5 12l7-7 7 7" }, null, -1))], 64)) : __props.direction === "down" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [_cache[2] || (_cache[2] = createBaseVNode("path", { d: "M12 5v14" }, null, -1)), _cache[3] || (_cache[3] = createBaseVNode("path", { d: "M5 12l7 7 7-7" }, null, -1))], 64)) : __props.direction === "right" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [_cache[4] || (_cache[4] = createBaseVNode("path", { d: "M5 12h14" }, null, -1)), _cache[5] || (_cache[5] = createBaseVNode("path", { d: "M12 5l7 7-7 7" }, null, -1))], 64)) : __props.direction === "left" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [_cache[6] || (_cache[6] = createBaseVNode("path", { d: "M19 12H5" }, null, -1)), _cache[7] || (_cache[7] = createBaseVNode("path", { d: "M12 5l-7 7 7 7" }, null, -1))], 64)) : createCommentVNode("", true)], 8, _hoisted_1$11);
		};
	}
};
//#endregion
//#region src/utils/format.js
/**
* 格式化工具函数
*/
/**
* 格式化价格
* @param {number|string} price - 价格值
* @param {boolean} isRate - 是否为汇率（汇率显示4位小数）
* @returns {string} 格式化后的价格
*/
function formatPrice(price, isRate = false) {
	if (!price && price !== 0) return "--";
	if (typeof price === "string") return price;
	return price.toFixed(isRate ? 4 : 2);
}
/**
* 格式化涨跌值
* @param {number} change - 涨跌值
* @returns {string} 格式化后的涨跌值（带正负号）
*/
function formatChange(change) {
	if (!change && change !== 0) return "--";
	return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
}
/**
* 格式化涨跌幅
* @param {number} percent - 涨跌幅百分比
* @returns {string} 格式化后的涨跌幅（带正负号和%）
*/
function formatPercent(percent) {
	if (!percent && percent !== 0) return "--%";
	return `${percent >= 0 ? "+" : ""}${percent?.toFixed(2) || "0.00"}%`;
}
/**
* 计算趋势方向
* @param {number} value - 数值
* @returns {'up'|'down'|'flat'} 趋势方向
*/
function getTrend(value) {
	if (value > 0) return "up";
	if (value < 0) return "down";
	return "flat";
}
//#endregion
//#region src/components/StatsGrid.vue
var _hoisted_1$10 = { class: "stats-section" };
var _hoisted_2$10 = { class: "stat-inner" };
var _hoisted_3$10 = { class: "stat-header" };
var _hoisted_4$8 = { class: "stat-meta" };
var _hoisted_5$6 = { class: "stat-label" };
var _hoisted_6$6 = { class: "stat-symbol" };
var _hoisted_7$4 = { class: "stat-price" };
var _hoisted_8$4 = { class: "price-main" };
var _hoisted_9$4 = {
	key: 0,
	class: "price-sub"
};
var _hoisted_10$4 = {
	key: 0,
	class: "stat-change"
};
var _hoisted_11$4 = {
	key: 1,
	class: "stat-change stat-change-placeholder"
};
var _sfc_main$11 = {
	__name: "StatsGrid",
	props: {
		au9999: {
			type: Object,
			required: true
		},
		usFutures: {
			type: Object,
			required: true
		},
		ukFutures: {
			type: Object,
			required: true
		},
		paxg: {
			type: Object,
			required: true
		},
		usdCny: {
			type: Object,
			required: true
		},
		dxy: {
			type: Object,
			required: true
		},
		priceFlash: {
			type: Object,
			required: true
		}
	},
	setup(__props) {
		const props = __props;
		const conversionRate = computed(() => {
			return (props.usdCny?.current || 7.2) / OZ_TO_GRAM;
		});
		const stats = computed(() => {
			const { au9999, usFutures, ukFutures, paxg, usdCny, dxy, priceFlash } = props;
			const rate = conversionRate.value;
			return [
				{
					key: "au9999",
					label: "上海黄金",
					symbol: "Au9999",
					cnyPrice: au9999.current,
					usdPrice: null,
					change: au9999.change,
					percent: au9999.changePercent,
					trend: getTrend(au9999.change),
					isRate: false,
					flash: priceFlash.au9999
				},
				{
					key: "usFutures",
					label: "美国期货",
					symbol: "COMEX",
					cnyPrice: (usFutures.current * rate).toFixed(2),
					usdPrice: usFutures.current,
					change: usFutures.change,
					percent: usFutures.changePercent,
					trend: getTrend(usFutures.change),
					isRate: false,
					flash: priceFlash.usFutures
				},
				{
					key: "ukFutures",
					label: "伦敦金",
					symbol: "XAU",
					cnyPrice: (ukFutures.current * rate).toFixed(2),
					usdPrice: ukFutures.current,
					change: ukFutures.change,
					percent: ukFutures.changePercent,
					trend: getTrend(ukFutures.change),
					isRate: false,
					flash: priceFlash.ukFutures
				},
				{
					key: "paxg",
					label: "数字黄金",
					symbol: "PAXG",
					cnyPrice: (paxg.current * rate).toFixed(2),
					usdPrice: paxg.current,
					change: paxg.change || 0,
					percent: paxg.changePercent || 0,
					trend: getTrend(paxg.change),
					isRate: false,
					flash: priceFlash.paxg
				},
				{
					key: "usdCny",
					label: "人民币汇率",
					symbol: "USD/CNY",
					cnyPrice: usdCny.current,
					usdPrice: null,
					change: usdCny.change,
					percent: usdCny.changePercent,
					trend: getTrend(usdCny.change),
					isRate: true,
					flash: priceFlash.usdCny
				},
				{
					key: "dxy",
					label: "美元指数",
					symbol: "DXY",
					cnyPrice: dxy.current,
					usdPrice: null,
					change: dxy.change || 0,
					percent: dxy.changePercent || 0,
					trend: getTrend(dxy.change),
					isRate: true,
					flash: priceFlash.dxy
				}
			].map((item) => ({
				...item,
				showChange: true
			}));
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("section", _hoisted_1$10, [(openBlock(true), createElementBlock(Fragment, null, renderList(stats.value, (stat, index) => {
				return openBlock(), createElementBlock("div", {
					key: stat.key,
					class: normalizeClass(["stat-card", [stat.trend, {
						"is-rate": stat.isRate,
						"price-flash": stat.flash
					}]]),
					style: normalizeStyle({ animationDelay: `${index * .08}s` })
				}, [createBaseVNode("div", { class: normalizeClass(["stat-glow", stat.trend]) }, null, 2), createBaseVNode("div", _hoisted_2$10, [
					createBaseVNode("div", _hoisted_3$10, [createBaseVNode("div", _hoisted_4$8, [createBaseVNode("span", _hoisted_5$6, toDisplayString(stat.label), 1), createBaseVNode("span", _hoisted_6$6, toDisplayString(stat.symbol), 1)]), stat.showChange ? (openBlock(), createElementBlock("div", {
						key: 0,
						class: normalizeClass(["stat-badge", stat.trend])
					}, [createVNode(_sfc_main$12, {
						direction: stat.trend,
						size: 12
					}, null, 8, ["direction"])], 2)) : createCommentVNode("", true)]),
					createBaseVNode("div", _hoisted_7$4, [createBaseVNode("span", _hoisted_8$4, toDisplayString(stat.isRate ? "" : "¥") + toDisplayString(unref(formatPrice)(stat.cnyPrice, stat.isRate)) + toDisplayString(stat.isRate ? "" : "/g"), 1), stat.usdPrice ? (openBlock(), createElementBlock("span", _hoisted_9$4, "$" + toDisplayString(unref(formatPrice)(stat.usdPrice)) + "/oz", 1)) : createCommentVNode("", true)]),
					stat.showChange ? (openBlock(), createElementBlock("div", _hoisted_10$4, [createBaseVNode("span", { class: normalizeClass(["change-value", stat.trend]) }, toDisplayString(unref(formatChange)(stat.change)), 3), createBaseVNode("span", { class: normalizeClass(["change-percent", stat.trend]) }, toDisplayString(unref(formatPercent)(stat.percent)), 3)])) : (openBlock(), createElementBlock("div", _hoisted_11$4, [..._cache[0] || (_cache[0] = [createBaseVNode("span", { class: "change-value" }, "--", -1), createBaseVNode("span", { class: "change-percent" }, "--", -1)])]))
				])], 6);
			}), 128))]);
		};
	}
};
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region src/components/KlineChart.vue
var _hoisted_1$9 = { class: "kline-chart" };
var _hoisted_2$9 = { class: "chart-header" };
var _hoisted_3$9 = { class: "header-row" };
var _hoisted_4$7 = { class: "title-row" };
var _hoisted_5$5 = { class: "chart-title" };
var _hoisted_6$5 = {
	key: 0,
	class: "last-price"
};
var _hoisted_7$3 = { class: "price-main" };
var _hoisted_8$3 = { class: "change-value" };
var _hoisted_9$3 = { class: "change-percent" };
var _hoisted_10$3 = { class: "period-tabs" };
var _hoisted_11$3 = ["onClick"];
var _hoisted_12$3 = {
	key: 0,
	class: "chart-stats"
};
var _hoisted_13$3 = { class: "stat-item" };
var _hoisted_14$2 = { class: "stat-value" };
var _hoisted_15$2 = { class: "stat-item high" };
var _hoisted_16$2 = { class: "stat-value" };
var _hoisted_17$2 = { class: "stat-item low" };
var _hoisted_18$1 = { class: "stat-value" };
var _hoisted_19$1 = { class: "stat-item" };
var _hoisted_20$1 = { class: "stat-value" };
var CACHE_TTL = 6e4;
var KlineChart_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "KlineChart",
	props: {
		title: {
			type: String,
			default: "K线图"
		},
		symbol: {
			type: String,
			default: "AU0"
		},
		apiEndpoint: {
			type: String,
			default: ""
		},
		height: {
			type: [Number, String],
			default: 400
		},
		availablePeriods: {
			type: Array,
			default: () => [
				"5",
				"15",
				"30",
				"60",
				"day",
				"week",
				"month"
			]
		},
		defaultPeriod: {
			type: String,
			default: "day"
		}
	},
	setup(__props) {
		const props = __props;
		const API_BASE_URL = API_BASE + "/api";
		const chartRef = ref(null);
		let chart = null;
		const loading = ref(true);
		const klineData = ref([]);
		const currentPeriod = ref(props.defaultPeriod);
		const klineCache = /* @__PURE__ */ new Map();
		const getCacheKey = (symbol, period) => {
			return `${symbol || "default"}_${period}`;
		};
		const getFromCache = (key) => {
			const cached = klineCache.get(key);
			if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
			return null;
		};
		const saveToCache = (key, data) => {
			klineCache.set(key, {
				data,
				timestamp: Date.now()
			});
		};
		const allPeriods = [
			{
				value: "5",
				label: "5分"
			},
			{
				value: "15",
				label: "15分"
			},
			{
				value: "30",
				label: "30分"
			},
			{
				value: "60",
				label: "60分"
			},
			{
				value: "day",
				label: "日K"
			},
			{
				value: "week",
				label: "周K"
			},
			{
				value: "month",
				label: "月K"
			}
		];
		const periods = computed(() => {
			return allPeriods.filter((p) => props.availablePeriods.includes(p.value));
		});
		const lastKline = computed(() => {
			if (klineData.value.length === 0) return null;
			return klineData.value[klineData.value.length - 1];
		});
		const lastOpen = computed(() => lastKline.value?.open || 0);
		const lastHigh = computed(() => lastKline.value?.high || 0);
		const lastLow = computed(() => lastKline.value?.low || 0);
		const lastClose = computed(() => lastKline.value?.close || 0);
		const lastVolume = computed(() => lastKline.value?.volume || 0);
		const prevClose = computed(() => {
			if (klineData.value.length < 2) return lastOpen.value;
			return klineData.value[klineData.value.length - 2].close;
		});
		const changeValue = computed(() => lastClose.value - prevClose.value);
		const changePercent = computed(() => {
			if (prevClose.value === 0) return 0;
			return changeValue.value / prevClose.value * 100;
		});
		const changeSign = computed(() => changeValue.value >= 0 ? "+" : "");
		const priceTrend = computed(() => changeValue.value >= 0 ? "up" : "down");
		const formatVolume = (vol) => {
			if (!vol || vol === 0) return "--";
			if (vol >= 1e8) return (vol / 1e8).toFixed(2) + "亿";
			if (vol >= 1e4) return (vol / 1e4).toFixed(2) + "万";
			return vol.toFixed(0);
		};
		const fetchKlineData$1 = async (forceRefresh = false) => {
			const cacheKey = getCacheKey(props.symbol || props.apiEndpoint, currentPeriod.value);
			if (!forceRefresh) {
				const cachedData = getFromCache(cacheKey);
				if (cachedData) {
					klineData.value = cachedData;
					loading.value = false;
					updateChart();
					return;
				}
			}
			loading.value = true;
			try {
				let data;
				if (props.apiEndpoint) {
					const url = `${API_BASE_URL}${props.apiEndpoint}?period=${currentPeriod.value}`;
					const response = await axios.get(url, { timeout: 15e3 });
					if (response.data?.success && response.data?.data) data = response.data.data;
				} else data = await fetchKlineData(props.symbol, currentPeriod.value);
				if (data) {
					klineData.value = data;
					saveToCache(cacheKey, data);
					updateChart();
				}
			} catch (error) {
				console.error("Failed to fetch kline data:", error);
			} finally {
				loading.value = false;
			}
		};
		const initChart = () => {
			if (!chartRef.value) return;
			chart = init(chartRef.value, null, {
				renderer: "canvas",
				useDirtyRect: true
			});
			chart.setOption({
				backgroundColor: "transparent",
				animation: false,
				grid: [{
					left: "8%",
					right: "3%",
					top: "5%",
					height: "55%"
				}, {
					left: "8%",
					right: "3%",
					top: "65%",
					height: "20%"
				}],
				xAxis: [{
					type: "category",
					data: [],
					boundaryGap: true,
					axisLine: { lineStyle: { color: "#cbd5e1" } },
					axisLabel: {
						color: "#64748b",
						fontSize: 11,
						interval: "auto"
					},
					splitLine: { show: false }
				}, {
					type: "category",
					gridIndex: 1,
					data: [],
					boundaryGap: true,
					axisLine: { lineStyle: { color: "#cbd5e1" } },
					axisLabel: { show: false },
					splitLine: { show: false }
				}],
				yAxis: [{
					type: "value",
					scale: true,
					axisLine: { lineStyle: { color: "#cbd5e1" } },
					splitLine: { lineStyle: { color: "#e2e8f0" } },
					axisLabel: {
						color: "#64748b",
						fontSize: 11,
						formatter: (value) => value.toFixed(0)
					}
				}, {
					type: "value",
					gridIndex: 1,
					scale: true,
					axisLine: { lineStyle: { color: "#cbd5e1" } },
					splitLine: { lineStyle: { color: "#e2e8f0" } },
					axisLabel: {
						color: "#64748b",
						fontSize: 11,
						formatter: (value) => {
							if (value >= 1e4) return (value / 1e4).toFixed(0) + "万";
							return value.toFixed(0);
						}
					}
				}],
				dataZoom: [{
					type: "inside",
					xAxisIndex: [0, 1],
					start: 50,
					end: 100
				}],
				tooltip: {
					trigger: "axis",
					axisPointer: { type: "cross" },
					backgroundColor: "rgba(255, 255, 255, 0.95)",
					borderColor: "#e2e8f0",
					textStyle: {
						color: "#1e293b",
						fontSize: 13
					},
					formatter: (params) => {
						if (!params || params.length === 0) return "";
						const kline = params[0];
						const data = klineData.value[kline.dataIndex];
						if (!data) return "";
						const change = data.close - data.open;
						const changePercent = data.open > 0 ? change / data.open * 100 : 0;
						const color = change >= 0 ? "#f97316" : "#10b981";
						const sign = change >= 0 ? "+" : "";
						return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #8b5cf6;">${data.date}</div>
            <div style="display: grid; grid-template-columns: 60px 80px; gap: 4px;">
              <span style="color: #64748b;">开盘:</span>
              <span style="color: #1e293b;">${data.open.toFixed(2)}</span>
              <span style="color: #64748b;">收盘:</span>
              <span style="color: ${color}; font-weight: bold;">${data.close.toFixed(2)}</span>
              <span style="color: #64748b;">最高:</span>
              <span style="color: #f97316;">${data.high.toFixed(2)}</span>
              <span style="color: #64748b;">最低:</span>
              <span style="color: #10b981;">${data.low.toFixed(2)}</span>
              <span style="color: #64748b;">涨跌:</span>
              <span style="color: ${color};">${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>
              <span style="color: #64748b;">成交量:</span>
              <span style="color: #1e293b;">${formatVolume(data.volume)}</span>
            </div>
          </div>
        `;
					}
				},
				series: [{
					name: "K线",
					type: "candlestick",
					data: [],
					itemStyle: {
						color: "#f97316",
						color0: "#10b981",
						borderColor: "#f97316",
						borderColor0: "#10b981"
					},
					barWidth: "60%"
				}, {
					name: "成交量",
					type: "bar",
					xAxisIndex: 1,
					yAxisIndex: 1,
					data: [],
					itemStyle: { color: (params) => {
						const data = klineData.value[params.dataIndex];
						if (!data) return "#94a3b8";
						return data.close >= data.open ? "#f97316" : "#10b981";
					} },
					barWidth: "60%"
				}]
			});
		};
		const updateChart = () => {
			if (!chart || klineData.value.length === 0) return;
			const dates = klineData.value.map((d) => d.date);
			const ohlc = klineData.value.map((d) => [
				d.open,
				d.close,
				d.low,
				d.high
			]);
			const volumes = klineData.value.map((d) => d.volume);
			chart.setOption({
				xAxis: [{ data: dates }, { data: dates }],
				series: [{ data: ohlc }, { data: volumes }]
			});
		};
		const changePeriod = (period) => {
			currentPeriod.value = period;
			fetchKlineData$1();
		};
		const handleResize = () => {
			chart && chart.resize();
		};
		watch(() => props.symbol, () => {
			fetchKlineData$1();
		});
		onMounted(() => {
			initChart();
			fetchKlineData$1();
			window.addEventListener("resize", handleResize);
		});
		onUnmounted(() => {
			window.removeEventListener("resize", handleResize);
			chart && chart.dispose();
		});
		return (_ctx, _cache) => {
			const _directive_loading = resolveDirective("loading");
			return openBlock(), createElementBlock("div", _hoisted_1$9, [
				createBaseVNode("div", _hoisted_2$9, [createBaseVNode("div", _hoisted_3$9, [createBaseVNode("div", _hoisted_4$7, [_cache[0] || (_cache[0] = createBaseVNode("span", { class: "chart-icon" }, "📊", -1)), createBaseVNode("h3", _hoisted_5$5, toDisplayString(__props.title), 1)]), klineData.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6$5, [createBaseVNode("div", _hoisted_7$3, [_cache[1] || (_cache[1] = createBaseVNode("span", { class: "price-label" }, "最新价", -1)), createBaseVNode("span", { class: normalizeClass(["price-value", priceTrend.value]) }, toDisplayString(lastClose.value.toFixed(2)), 3)]), createBaseVNode("div", { class: normalizeClass(["price-change-wrapper", priceTrend.value]) }, [createBaseVNode("span", _hoisted_8$3, toDisplayString(changeSign.value) + toDisplayString(changeValue.value.toFixed(2)), 1), createBaseVNode("span", _hoisted_9$3, toDisplayString(changeSign.value) + toDisplayString(changePercent.value.toFixed(2)) + "%", 1)], 2)])) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_10$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(periods.value, (p) => {
					return openBlock(), createElementBlock("button", {
						key: p.value,
						class: normalizeClass(["period-btn", { active: currentPeriod.value === p.value }]),
						onClick: ($event) => changePeriod(p.value)
					}, toDisplayString(p.label), 11, _hoisted_11$3);
				}), 128))])]),
				withDirectives(createBaseVNode("div", {
					ref_key: "chartRef",
					ref: chartRef,
					class: "chart-container"
				}, null, 512), [[_directive_loading, loading.value]]),
				klineData.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12$3, [
					createBaseVNode("div", _hoisted_13$3, [
						_cache[2] || (_cache[2] = createBaseVNode("span", { class: "stat-icon" }, "📈", -1)),
						_cache[3] || (_cache[3] = createBaseVNode("span", { class: "stat-label" }, "开盘", -1)),
						createBaseVNode("span", _hoisted_14$2, toDisplayString(lastOpen.value.toFixed(2)), 1)
					]),
					createBaseVNode("div", _hoisted_15$2, [
						_cache[4] || (_cache[4] = createBaseVNode("span", { class: "stat-icon" }, "⬆️", -1)),
						_cache[5] || (_cache[5] = createBaseVNode("span", { class: "stat-label" }, "最高", -1)),
						createBaseVNode("span", _hoisted_16$2, toDisplayString(lastHigh.value.toFixed(2)), 1)
					]),
					createBaseVNode("div", _hoisted_17$2, [
						_cache[6] || (_cache[6] = createBaseVNode("span", { class: "stat-icon" }, "⬇️", -1)),
						_cache[7] || (_cache[7] = createBaseVNode("span", { class: "stat-label" }, "最低", -1)),
						createBaseVNode("span", _hoisted_18$1, toDisplayString(lastLow.value.toFixed(2)), 1)
					]),
					createBaseVNode("div", _hoisted_19$1, [
						_cache[8] || (_cache[8] = createBaseVNode("span", { class: "stat-icon" }, "📊", -1)),
						_cache[9] || (_cache[9] = createBaseVNode("span", { class: "stat-label" }, "成交量", -1)),
						createBaseVNode("span", _hoisted_20$1, toDisplayString(formatVolume(lastVolume.value)), 1)
					])
				])) : createCommentVNode("", true)
			]);
		};
	}
}, [["__scopeId", "data-v-1057944a"]]);
//#endregion
//#region src/components/ChartsSection.vue
var _hoisted_1$8 = { class: "charts-section" };
var _hoisted_2$8 = { class: "charts-grid" };
var _hoisted_3$8 = { class: "chart-wrapper" };
var _hoisted_4$6 = { class: "chart-wrapper" };
var _sfc_main$9 = {
	__name: "ChartsSection",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("section", _hoisted_1$8, [createBaseVNode("div", _hoisted_2$8, [createBaseVNode("div", _hoisted_3$8, [createVNode(KlineChart_default, {
				title: "上海黄金 K线",
				symbol: "AU0",
				"available-periods": ["day"]
			})]), createBaseVNode("div", _hoisted_4$6, [createVNode(KlineChart_default, {
				title: "美国期货 K线",
				"api-endpoint": "/kline/us",
				"default-period": "5",
				"available-periods": [
					"5",
					"15",
					"30",
					"60",
					"day",
					"week",
					"month"
				]
			})])])]);
		};
	}
};
//#endregion
//#region src/components/SettingsPanel.vue
var _hoisted_1$7 = { class: "settings-panel" };
var _hoisted_2$7 = {
	key: 0,
	class: "settings-dropdown"
};
var _hoisted_3$7 = { class: "setting-item info-item" };
var SettingsPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "SettingsPanel",
	props: { pollingMode: {
		type: String,
		default: "active"
	} },
	setup(__props) {
		const props = __props;
		const showPanel = ref(false);
		const pollingModeText = computed(() => {
			return {
				active: "活跃",
				normal: "正常",
				calm: "平静",
				inactive: "休眠"
			}[props.pollingMode] || "活跃";
		});
		const pollingIntervalText = computed(() => {
			return {
				active: "5秒",
				normal: "10秒",
				calm: "20秒",
				inactive: "30秒"
			}[props.pollingMode] || "5秒";
		});
		const handleEsc = (e) => {
			if (e.key === "Escape") showPanel.value = false;
		};
		onMounted(() => {
			document.addEventListener("keydown", handleEsc);
		});
		onUnmounted(() => {
			document.removeEventListener("keydown", handleEsc);
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$7, [
				createBaseVNode("button", {
					class: "settings-btn",
					onClick: _cache[0] || (_cache[0] = ($event) => showPanel.value = !showPanel.value)
				}, [..._cache[2] || (_cache[2] = [createBaseVNode("svg", {
					width: "16",
					height: "16",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "2"
				}, [createBaseVNode("circle", {
					cx: "12",
					cy: "12",
					r: "3"
				}), createBaseVNode("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })], -1), createBaseVNode("span", { class: "btn-text" }, "设置", -1)])]),
				createVNode(Transition, { name: "dropdown" }, {
					default: withCtx(() => [showPanel.value ? (openBlock(), createElementBlock("div", _hoisted_2$7, [
						_cache[4] || (_cache[4] = createBaseVNode("div", { class: "dropdown-header" }, [createBaseVNode("span", { class: "dropdown-icon" }, "⚙"), createBaseVNode("span", { class: "dropdown-title" }, "系统设置")], -1)),
						createBaseVNode("div", _hoisted_3$7, [_cache[3] || (_cache[3] = createBaseVNode("div", { class: "setting-header" }, [createBaseVNode("span", { class: "setting-icon" }, "📊"), createBaseVNode("span", { class: "setting-label" }, "智能轮询")], -1)), createBaseVNode("div", { class: normalizeClass(["setting-value", __props.pollingMode]) }, [createBaseVNode("span", { class: normalizeClass(["mode-indicator", __props.pollingMode]) }, null, 2), createTextVNode(" " + toDisplayString(pollingModeText.value) + " (" + toDisplayString(pollingIntervalText.value) + ") ", 1)], 2)]),
						_cache[5] || (_cache[5] = createBaseVNode("div", { class: "setting-item info-item" }, [createBaseVNode("div", { class: "setting-header" }, [createBaseVNode("span", { class: "setting-icon" }, "📰"), createBaseVNode("span", { class: "setting-label" }, "资讯数据")]), createBaseVNode("div", { class: "setting-value" }, "自动刷新 (5分钟)")], -1)),
						_cache[6] || (_cache[6] = createBaseVNode("div", { class: "dropdown-footer" }, [createBaseVNode("span", { class: "footer-tip" }, "根据数据变化频率自动调整刷新间隔")], -1))
					])) : createCommentVNode("", true)]),
					_: 1
				}),
				showPanel.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "overlay",
					onClick: _cache[1] || (_cache[1] = ($event) => showPanel.value = false)
				})) : createCommentVNode("", true)
			]);
		};
	}
}, [["__scopeId", "data-v-d99df392"]]);
var Skeleton_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "Skeleton",
	props: {
		width: {
			type: [String, Number],
			default: "100%"
		},
		height: {
			type: [String, Number],
			default: 20
		},
		radius: {
			type: [String, Number],
			default: 4
		},
		animate: {
			type: Boolean,
			default: true
		}
	},
	setup(__props) {
		const props = __props;
		const blockStyle = computed(() => ({
			width: typeof props.width === "number" ? `${props.width}px` : props.width,
			height: typeof props.height === "number" ? `${props.height}px` : props.height,
			borderRadius: typeof props.radius === "number" ? `${props.radius}px` : props.radius
		}));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["skeleton", { "animate": __props.animate }]) }, [renderSlot(_ctx.$slots, "default", {}, () => [createBaseVNode("div", {
				class: "skeleton-block",
				style: normalizeStyle(blockStyle.value)
			}, null, 4)], true)], 2);
		};
	}
}, [["__scopeId", "data-v-b56fbd64"]]);
//#endregion
//#region src/components/NewsPanel.vue
var _hoisted_1$6 = { class: "news-panel" };
var _hoisted_2$6 = { class: "panel-header" };
var _hoisted_3$6 = { class: "header-right" };
var _hoisted_4$5 = {
	key: 0,
	class: "news-count"
};
var _hoisted_5$4 = ["disabled"];
var _hoisted_6$4 = {
	key: 0,
	class: "news-skeleton"
};
var _hoisted_7$2 = { class: "skeleton-content" };
var _hoisted_8$2 = {
	key: 1,
	class: "news-list"
};
var _hoisted_9$2 = ["href", "onClick"];
var _hoisted_10$2 = { class: "news-index" };
var _hoisted_11$2 = { class: "news-content" };
var _hoisted_12$2 = { class: "news-meta" };
var _hoisted_13$2 = { class: "news-source" };
var _hoisted_14$1 = { class: "news-time" };
var _hoisted_15$1 = { class: "news-title" };
var _hoisted_16$1 = {
	key: 0,
	class: "news-summary"
};
var _hoisted_17$1 = {
	key: 2,
	class: "empty-state"
};
var NewsPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "NewsPanel",
	props: { refreshInterval: {
		type: Number,
		default: 3e5
	} },
	setup(__props) {
		const props = __props;
		const newsList = ref([]);
		const loading = ref(false);
		const error = ref(null);
		const loadNews = async () => {
			loading.value = true;
			error.value = null;
			try {
				const data = await fetchNews();
				if (Array.isArray(data)) newsList.value = data;
				else error.value = "获取资讯失败";
			} catch (err) {
				console.error("Failed to load news:", err);
				error.value = "网络请求失败";
			} finally {
				loading.value = false;
			}
		};
		const openNews = (news) => {
			if (news.url) window.open(news.url, "_blank");
		};
		let refreshTimer = null;
		const setupRefreshTimer = () => {
			if (refreshTimer) clearInterval(refreshTimer);
			refreshTimer = setInterval(loadNews, props.refreshInterval);
		};
		watch(() => props.refreshInterval, () => {
			setupRefreshTimer();
		});
		onMounted(() => {
			loadNews();
			setupRefreshTimer();
		});
		onUnmounted(() => {
			if (refreshTimer) clearInterval(refreshTimer);
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$6, [createBaseVNode("div", _hoisted_2$6, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "header-left" }, [createBaseVNode("h3", { class: "panel-title" }, [createBaseVNode("span", { class: "title-icon" }, "📰"), createTextVNode(" 黄金资讯 ")]), createBaseVNode("span", { class: "panel-subtitle" }, "GOLD NEWS")], -1)), createBaseVNode("div", _hoisted_3$6, [!loading.value && newsList.value.length > 0 ? (openBlock(), createElementBlock("span", _hoisted_4$5, toDisplayString(Math.min(newsList.value.length, 30)) + " 条", 1)) : createCommentVNode("", true), createBaseVNode("button", {
				class: "refresh-btn",
				onClick: loadNews,
				disabled: loading.value
			}, [(openBlock(), createElementBlock("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				"stroke-width": "2",
				class: normalizeClass({ rotating: loading.value })
			}, [..._cache[0] || (_cache[0] = [createBaseVNode("path", { d: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" }, null, -1)])], 2)), _cache[1] || (_cache[1] = createTextVNode(" 刷新 ", -1))], 8, _hoisted_5$4)])]), loading.value ? (openBlock(), createElementBlock("div", _hoisted_6$4, [(openBlock(), createElementBlock(Fragment, null, renderList(6, (i) => {
				return createBaseVNode("div", {
					key: i,
					class: "skeleton-item"
				}, [createVNode(Skeleton_default, {
					width: "24px",
					height: "24px",
					radius: "4px"
				}), createBaseVNode("div", _hoisted_7$2, [
					createVNode(Skeleton_default, {
						width: "50%",
						height: "10px"
					}),
					createVNode(Skeleton_default, {
						width: "90%",
						height: "13px"
					}),
					createVNode(Skeleton_default, {
						width: "60px",
						height: "9px"
					})
				])]);
			}), 64))])) : newsList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_8$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(newsList.value.slice(0, 30), (news, index) => {
				return openBlock(), createElementBlock("a", {
					key: index,
					href: news.url || "#",
					target: "_blank",
					rel: "noopener noreferrer",
					class: "news-item",
					style: normalizeStyle({ animationDelay: `${index * .03}s` }),
					onClick: withModifiers(($event) => openNews(news), ["prevent"])
				}, [
					createBaseVNode("div", _hoisted_10$2, toDisplayString(String(index + 1).padStart(2, "0")), 1),
					createBaseVNode("div", _hoisted_11$2, [
						createBaseVNode("div", _hoisted_12$2, [
							news.tag ? (openBlock(), createElementBlock("span", {
								key: 0,
								class: normalizeClass(["news-tag", news.tagClass])
							}, toDisplayString(news.tag), 3)) : createCommentVNode("", true),
							createBaseVNode("span", _hoisted_13$2, toDisplayString(news.source), 1),
							createBaseVNode("span", _hoisted_14$1, toDisplayString(news.time), 1)
						]),
						createBaseVNode("div", _hoisted_15$1, toDisplayString(news.title), 1),
						news.summary ? (openBlock(), createElementBlock("div", _hoisted_16$1, toDisplayString(news.summary), 1)) : createCommentVNode("", true)
					]),
					_cache[3] || (_cache[3] = createBaseVNode("div", { class: "news-arrow" }, [createBaseVNode("svg", {
						width: "12",
						height: "12",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2"
					}, [createBaseVNode("path", { d: "M9 18l6-6-6-6" })])], -1))
				], 12, _hoisted_9$2);
			}), 128))])) : (openBlock(), createElementBlock("div", _hoisted_17$1, [
				_cache[4] || (_cache[4] = createBaseVNode("span", { class: "empty-icon" }, "📭", -1)),
				_cache[5] || (_cache[5] = createBaseVNode("span", { class: "empty-text" }, "暂无资讯", -1)),
				createBaseVNode("button", {
					class: "retry-btn",
					onClick: loadNews
				}, "重新加载")
			]))]);
		};
	}
}, [["__scopeId", "data-v-6a3d25f9"]]);
//#endregion
//#region src/utils/technicalIndicators.js
/**
* 技术指标计算工具集
* 用于黄金价格走势分析
*
* 注意：由于历史数据仅30分钟（360条），部分指标参数已调整
*/
/**
* 简单移动平均线 (SMA)
* @param {number[]} prices - 价格数组
* @param {number} period - 周期
* @returns {number|null} - SMA值
*/
var calculateSMA = (prices, period) => {
	if (prices.length < period) return null;
	return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
};
/**
* 指数移动平均线 (EMA)
* @param {number[]} prices - 价格数组
* @param {number} period - 周期
* @returns {number|null} - EMA值
*/
var calculateEMA = (prices, period) => {
	if (prices.length < period) return null;
	const k = 2 / (period + 1);
	let ema = calculateSMA(prices.slice(0, period), period);
	for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
	return ema;
};
/**
* 计算 MACD 指标
* 适配30分钟数据：参数调整为 (6, 13, 4)
* 标准参数：(12, 26, 9)
*
* @param {number[]} prices - 价格数组
* @param {object} params - 参数 { fastPeriod, slowPeriod, signalPeriod }
* @returns {object} - { dif, dea, macd, histogram, trend }
*/
var calculateMACD = (prices, params = {}) => {
	const { fastPeriod = 6, slowPeriod = 13, signalPeriod = 4 } = params;
	if (prices.length < slowPeriod + signalPeriod) return {
		dif: null,
		dea: null,
		macd: null,
		histogram: null,
		trend: "neutral"
	};
	const emaFast = calculateEMA(prices, fastPeriod);
	const emaSlow = calculateEMA(prices, slowPeriod);
	if (emaFast === null || emaSlow === null) return {
		dif: null,
		dea: null,
		macd: null,
		histogram: null,
		trend: "neutral"
	};
	const dif = emaFast - emaSlow;
	const difArray = [];
	let tempEmaFast = calculateSMA(prices.slice(0, fastPeriod), fastPeriod);
	let tempEmaSlow = calculateSMA(prices.slice(0, slowPeriod), slowPeriod);
	for (let i = slowPeriod; i < prices.length; i++) {
		if (tempEmaFast === null || tempEmaSlow === null) break;
		const kFast = 2 / (fastPeriod + 1);
		const kSlow = 2 / (slowPeriod + 1);
		tempEmaFast = prices[i] * kFast + tempEmaFast * (1 - kFast);
		tempEmaSlow = prices[i] * kSlow + tempEmaSlow * (1 - kSlow);
		difArray.push(tempEmaFast - tempEmaSlow);
	}
	const dea = calculateEMA(difArray, signalPeriod) || 0;
	const macd = (dif - dea) * 2;
	const histogram = macd;
	let trend = "neutral";
	if (dif > 0 && dea > 0 && dif > dea) trend = "bullish";
	else if (dif < 0 && dea < 0 && dif < dea) trend = "bearish";
	else if (dif > dea) trend = "bullish_weak";
	else if (dif < dea) trend = "bearish_weak";
	return {
		dif: Number(dif.toFixed(4)),
		dea: Number(dea.toFixed(4)),
		macd: Number(macd.toFixed(4)),
		histogram: Number(histogram.toFixed(4)),
		trend
	};
};
/**
* 计算 KDJ 随机指标
* @param {number[]} prices - 价格数组
* @param {object} params - 参数 { n, m1, m2 }
* @returns {object} - { k, d, j, signal }
*/
var calculateKDJ = (prices, params = {}) => {
	const { n = 9, m1 = 3, m2 = 3 } = params;
	if (prices.length < n) return {
		k: null,
		d: null,
		j: null,
		signal: "neutral"
	};
	const rsvArray = [];
	for (let i = n - 1; i < prices.length; i++) {
		const periodPrices = prices.slice(i - n + 1, i + 1);
		const highN = Math.max(...periodPrices);
		const lowN = Math.min(...periodPrices);
		const close = prices[i];
		const rsv = highN === lowN ? 50 : (close - lowN) / (highN - lowN) * 100;
		rsvArray.push(rsv);
	}
	const kArray = [];
	let k = 50;
	for (let i = 0; i < rsvArray.length; i++) {
		k = (k * (m1 - 1) + rsvArray[i]) / m1;
		kArray.push(k);
	}
	let d = 50;
	for (let i = 0; i < kArray.length; i++) d = (d * (m2 - 1) + kArray[i]) / m2;
	const currentK = kArray[kArray.length - 1];
	const j = 3 * currentK - 2 * d;
	let signal = "neutral";
	if (j > 100 || currentK > 80) signal = "overbought";
	else if (j < 0 || currentK < 20) signal = "oversold";
	else if (currentK > d && currentK > 50) signal = "bullish";
	else if (currentK < d && currentK < 50) signal = "bearish";
	return {
		k: Number(currentK.toFixed(2)),
		d: Number(d.toFixed(2)),
		j: Number(j.toFixed(2)),
		signal
	};
};
/**
* 计算威廉指标 (Williams %R)
* @param {number[]} prices - 价格数组
* @param {number} period - 周期，默认14
* @returns {object} - { value, signal }
*/
var calculateWilliamsR = (prices, period = 14) => {
	if (prices.length < period) return {
		value: null,
		signal: "neutral"
	};
	const periodPrices = prices.slice(-period);
	const highN = Math.max(...periodPrices);
	const lowN = Math.min(...periodPrices);
	const close = prices[prices.length - 1];
	const value = lowN === highN ? -50 : (highN - close) / (highN - lowN) * -100;
	let signal = "neutral";
	if (value > -20) signal = "overbought";
	else if (value < -80) signal = "oversold";
	else if (value > -50) signal = "bullish";
	else signal = "bearish";
	return {
		value: Number(value.toFixed(2)),
		signal
	};
};
/**
* 计算相对强弱指标 (RSI)
* @param {number[]} prices - 价格数组
* @param {number} period - 周期，默认14
* @returns {object} - { value, signal }
*/
var calculateRSI = (prices, period = 14) => {
	if (prices.length < period + 1) return {
		value: null,
		signal: "neutral"
	};
	let gains = 0;
	let losses = 0;
	for (let i = prices.length - period; i < prices.length; i++) {
		const change = prices[i] - prices[i - 1];
		if (change > 0) gains += change;
		else losses -= change;
	}
	if (losses === 0) return {
		value: 100,
		signal: "overbought"
	};
	const value = 100 - 100 / (1 + gains / losses);
	let signal = "neutral";
	if (value > 70) signal = "overbought";
	else if (value < 30) signal = "oversold";
	else if (value > 50) signal = "bullish";
	else signal = "bearish";
	return {
		value: Number(value.toFixed(2)),
		signal
	};
};
/**
* 计算布林带
* @param {number[]} prices - 价格数组
* @param {number} period - 周期，默认20
* @param {number} stdDevMultiplier - 标准差倍数，默认2
* @returns {object} - { upper, middle, lower, bandwidth, position }
*/
var calculateBollingerBands = (prices, period = 20, stdDevMultiplier = 2) => {
	const adjustedPeriod = Math.min(period, prices.length);
	if (adjustedPeriod < 5) return {
		upper: null,
		middle: null,
		lower: null,
		bandwidth: null,
		position: null
	};
	const slice = prices.slice(-adjustedPeriod);
	const middle = slice.reduce((a, b) => a + b, 0) / adjustedPeriod;
	const squaredDiffs = slice.map((p) => Math.pow(p - middle, 2));
	const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / adjustedPeriod);
	const upper = middle + stdDevMultiplier * stdDev;
	const lower = middle - stdDevMultiplier * stdDev;
	const bandwidth = (upper - lower) / middle * 100;
	const position = (prices[prices.length - 1] - lower) / (upper - lower);
	return {
		upper: Number(upper.toFixed(2)),
		middle: Number(middle.toFixed(2)),
		lower: Number(lower.toFixed(2)),
		bandwidth: Number(bandwidth.toFixed(2)),
		position: Number(position.toFixed(3))
	};
};
/**
* 综合技术指标分析
* @param {number[]} prices - 价格数组
* @param {number} currentPrice - 当前价格
* @returns {object} - 综合分析结果
*/
var analyzeTechnicalIndicators = (prices, currentPrice) => {
	const macd = calculateMACD(prices);
	const kdj = calculateKDJ(prices);
	const williamsR = calculateWilliamsR(prices);
	const rsi = calculateRSI(prices);
	const bollingerBands = calculateBollingerBands(prices);
	let score = 50;
	const signals = [];
	if (macd.trend === "bullish") {
		score += 12;
		signals.push({
			indicator: "MACD",
			type: "positive",
			text: `MACD多头运行，DIF=${macd.dif.toFixed(2)}`
		});
	} else if (macd.trend === "bearish") {
		score -= 12;
		signals.push({
			indicator: "MACD",
			type: "negative",
			text: `MACD空头运行，DIF=${macd.dif.toFixed(2)}`
		});
	} else if (macd.trend === "bullish_weak") {
		score += 5;
		signals.push({
			indicator: "MACD",
			type: "positive",
			text: "MACD金叉形成中"
		});
	} else if (macd.trend === "bearish_weak") {
		score -= 5;
		signals.push({
			indicator: "MACD",
			type: "negative",
			text: "MACD死叉风险"
		});
	}
	if (kdj.signal === "overbought") {
		score -= 10;
		signals.push({
			indicator: "KDJ",
			type: "negative",
			text: `KDJ超买(K=${kdj.k.toFixed(1)})，回调风险`
		});
	} else if (kdj.signal === "oversold") {
		score += 10;
		signals.push({
			indicator: "KDJ",
			type: "positive",
			text: `KDJ超卖(K=${kdj.k.toFixed(1)})，反弹机会`
		});
	} else if (kdj.signal === "bullish") {
		score += 8;
		signals.push({
			indicator: "KDJ",
			type: "positive",
			text: `KDJ多头(K=${kdj.k.toFixed(1)})`
		});
	} else if (kdj.signal === "bearish") {
		score -= 8;
		signals.push({
			indicator: "KDJ",
			type: "negative",
			text: `KDJ空头(K=${kdj.k.toFixed(1)})`
		});
	}
	if (rsi.signal === "overbought") {
		score -= 8;
		signals.push({
			indicator: "RSI",
			type: "negative",
			text: `RSI超买(${rsi.value.toFixed(1)})`
		});
	} else if (rsi.signal === "oversold") {
		score += 8;
		signals.push({
			indicator: "RSI",
			type: "positive",
			text: `RSI超卖(${rsi.value.toFixed(1)})`
		});
	} else if (rsi.signal === "bullish") {
		score += 5;
		signals.push({
			indicator: "RSI",
			type: "positive",
			text: `RSI偏强(${rsi.value.toFixed(1)})`
		});
	} else if (rsi.signal === "bearish") {
		score -= 5;
		signals.push({
			indicator: "RSI",
			type: "negative",
			text: `RSI偏弱(${rsi.value.toFixed(1)})`
		});
	}
	if (bollingerBands.position !== null) {
		if (bollingerBands.position > .9) {
			score -= 6;
			signals.push({
				indicator: "BOLL",
				type: "negative",
				text: "触及布林上轨，回调压力"
			});
		} else if (bollingerBands.position < .1) {
			score += 6;
			signals.push({
				indicator: "BOLL",
				type: "positive",
				text: "触及布林下轨，反弹机会"
			});
		} else if (bollingerBands.position > .7) {
			score += 3;
			signals.push({
				indicator: "BOLL",
				type: "positive",
				text: "布林带上行区间"
			});
		} else if (bollingerBands.position < .3) {
			score -= 3;
			signals.push({
				indicator: "BOLL",
				type: "negative",
				text: "布林带下行区间"
			});
		}
	}
	if (williamsR.signal === "overbought") {
		score -= 5;
		signals.push({
			indicator: "W%R",
			type: "negative",
			text: `威廉指标超买(${williamsR.value.toFixed(1)})`
		});
	} else if (williamsR.signal === "oversold") {
		score += 5;
		signals.push({
			indicator: "W%R",
			type: "positive",
			text: `威廉指标超卖(${williamsR.value.toFixed(1)})`
		});
	}
	score = Math.max(0, Math.min(100, Math.round(score)));
	let overallTrend = "neutral";
	if (score >= 65) overallTrend = "strong_bullish";
	else if (score >= 55) overallTrend = "bullish";
	else if (score <= 35) overallTrend = "strong_bearish";
	else if (score <= 45) overallTrend = "bearish";
	return {
		score,
		overallTrend,
		signals,
		indicators: {
			macd,
			kdj,
			rsi,
			williamsR,
			bollingerBands
		}
	};
};
//#endregion
//#region src/components/AnalysisPanel.vue
var _hoisted_1$5 = { class: "analysis-panel" };
var _hoisted_2$5 = { class: "analysis-content" };
var _hoisted_3$5 = { class: "analysis-sections" };
var _hoisted_4$4 = { class: "section-top" };
var _hoisted_5$3 = { class: "term-score" };
var _hoisted_6$3 = { class: "score-num" };
var _hoisted_7$1 = { class: "section-content" };
var _hoisted_8$1 = { class: "analysis-list" };
var _hoisted_9$1 = { class: "text" };
var _hoisted_10$1 = { class: "section-footer" };
var _hoisted_11$1 = { class: "section-top" };
var _hoisted_12$1 = { class: "term-score" };
var _hoisted_13$1 = { class: "score-num" };
var _hoisted_14 = { class: "section-content" };
var _hoisted_15 = { class: "analysis-list" };
var _hoisted_16 = { class: "text" };
var _hoisted_17 = { class: "section-footer" };
var _hoisted_18 = { class: "section-top" };
var _hoisted_19 = { class: "term-score" };
var _hoisted_20 = { class: "score-num" };
var _hoisted_21 = { class: "section-content" };
var _hoisted_22 = { class: "analysis-list" };
var _hoisted_23 = { class: "text" };
var _hoisted_24 = { class: "section-footer" };
var AnalysisPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "AnalysisPanel",
	setup(__props) {
		const store = useGoldStore();
		const lastDataHash = ref("");
		const shortTerm = ref({
			score: 50,
			label: "计算中",
			class: "neutral",
			suggestion: "等待数据..."
		});
		const midTerm = ref({
			score: 50,
			label: "计算中",
			class: "neutral",
			suggestion: "等待数据..."
		});
		const longTerm = ref({
			score: 50,
			label: "计算中",
			class: "neutral",
			suggestion: "等待数据..."
		});
		const shortAnalysis = ref([]);
		const midAnalysis = ref([]);
		const longAnalysis = ref([]);
		const technicalIndicators = ref(null);
		const calculateStdDev = (prices, period) => {
			if (prices.length < period) return 0;
			const slice = prices.slice(-period);
			const avg = slice.reduce((a, b) => a + b, 0) / period;
			const squaredDiffs = slice.map((p) => Math.pow(p - avg, 2));
			return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / period);
		};
		const calculateMomentum = (prices, period = 5) => {
			if (prices.length < period + 1) return 0;
			const current = prices[prices.length - 1];
			const past = prices[prices.length - 1 - period];
			return (current - past) / past * 100;
		};
		const calculateBollingerPosition = (currentPrice, prices, period = 20) => {
			if (prices.length < period) return .5;
			const ma = calculateSMA(prices, period);
			const stdDev = calculateStdDev(prices, period);
			if (stdDev === 0) return .5;
			const upperBand = ma + 2 * stdDev;
			const lowerBand = ma - 2 * stdDev;
			return (currentPrice - lowerBand) / (upperBand - lowerBand);
		};
		const calculateTrendStrength = (prices, period = 10) => {
			if (prices.length < period + 1) return 0;
			let upMoves = 0, downMoves = 0;
			for (let i = prices.length - period; i < prices.length; i++) {
				const change = prices[i] - prices[i - 1];
				if (change > 0) upMoves += Math.abs(change);
				else downMoves += Math.abs(change);
			}
			const totalMoves = upMoves + downMoves;
			if (totalMoves === 0) return 0;
			return Math.abs(upMoves - downMoves) / totalMoves * 100;
		};
		const calculatePriceSpread = () => {
			const au = store.au9999;
			const us = store.usFutures;
			const rate = store.usdCny;
			if (!au.current || !us.current || !rate.current) return {
				spread: 0,
				status: "normal"
			};
			const internationalCNY = us.current * rate.current / 31.1035;
			const spreadPercent = (au.current - internationalCNY) / internationalCNY * 100;
			let status = "normal";
			if (spreadPercent > 1.5) status = "premium";
			else if (spreadPercent < -.5) status = "discount";
			return {
				spread: spreadPercent,
				status
			};
		};
		const calculateDataHash = () => {
			const au = store.au9999;
			const us = store.usFutures;
			const uk = store.ukFutures;
			const rate = store.usdCny;
			return `${au.current}-${au.changePercent}-${us.current}-${us.changePercent}-${uk.current}-${uk.changePercent}-${rate.current}-${rate.change}`;
		};
		const analyzeShortTerm = (prices = null) => {
			const au = store.au9999;
			const us = store.usFutures;
			const uk = store.ukFutures;
			const dxy = store.dxy;
			let score = 50;
			const items = [];
			const priceArray = prices || (au.history || []).map((h) => h.price);
			const rsi = calculateRSI(priceArray, 14).value;
			if (rsi !== null) if (rsi > 70) {
				score -= 10;
				items.push({
					type: "negative",
					text: `RSI超买区(${rsi.toFixed(1)})，短期回调风险`
				});
			} else if (rsi > 60) {
				score += 5;
				items.push({
					type: "positive",
					text: `RSI偏强(${rsi.toFixed(1)})，多头动能充足`
				});
			} else if (rsi < 30) {
				score += 10;
				items.push({
					type: "positive",
					text: `RSI超卖区(${rsi.toFixed(1)})，反弹概率大`
				});
			} else if (rsi < 40) {
				score -= 5;
				items.push({
					type: "negative",
					text: `RSI偏弱(${rsi.toFixed(1)})，空头压力明显`
				});
			} else items.push({
				type: "neutral",
				text: `RSI中性区域(${rsi.toFixed(1)})`
			});
			if (priceArray.length >= 10) {
				const ma5 = calculateSMA(priceArray, 5);
				const ma10 = calculateSMA(priceArray, 10);
				const currentPrice = au.current;
				if (ma5 && ma10) {
					const ma5AboveMa10 = ma5 > ma10;
					const priceAboveMa5 = currentPrice > ma5;
					if (ma5AboveMa10 && priceAboveMa5) {
						score += 15;
						items.push({
							type: "positive",
							text: `多头排列：MA5(${ma5.toFixed(2)}) > MA10(${ma10.toFixed(2)})`
						});
					} else if (!ma5AboveMa10 && !priceAboveMa5) {
						score -= 15;
						items.push({
							type: "negative",
							text: `空头排列：MA5(${ma5.toFixed(2)}) < MA10(${ma10.toFixed(2)})`
						});
					} else if (ma5AboveMa10 && !priceAboveMa5) {
						score += 5;
						items.push({
							type: "neutral",
							text: `均线金叉形成中，价格回踩MA5`
						});
					} else {
						score -= 5;
						items.push({
							type: "neutral",
							text: `均线死叉风险，价格承压`
						});
					}
				}
			}
			if (priceArray.length >= 20) {
				const bbPos = calculateBollingerPosition(au.current, priceArray, 20);
				if (bbPos > .9) {
					score -= 8;
					items.push({
						type: "negative",
						text: `触及布林上轨，短期回调压力`
					});
				} else if (bbPos > .7) {
					score += 5;
					items.push({
						type: "positive",
						text: `布林带上行区间，趋势偏强`
					});
				} else if (bbPos < .1) {
					score += 8;
					items.push({
						type: "positive",
						text: `触及布林下轨，反弹机会`
					});
				} else if (bbPos < .3) {
					score -= 5;
					items.push({
						type: "negative",
						text: `布林带下行区间，趋势偏弱`
					});
				} else items.push({
					type: "neutral",
					text: `布林带中轨附近，方向待明`
				});
			}
			if (priceArray.length >= 6) {
				const momentum = calculateMomentum(priceArray, 5);
				if (momentum > .5) {
					score += 12;
					items.push({
						type: "positive",
						text: `动量强劲 +${momentum.toFixed(2)}%，上涨动能足`
					});
				} else if (momentum > .2) {
					score += 6;
					items.push({
						type: "positive",
						text: `动量偏多 +${momentum.toFixed(2)}%`
					});
				} else if (momentum < -.5) {
					score -= 12;
					items.push({
						type: "negative",
						text: `动量转弱 ${momentum.toFixed(2)}%，下跌加速`
					});
				} else if (momentum < -.2) {
					score -= 6;
					items.push({
						type: "negative",
						text: `动量偏空 ${momentum.toFixed(2)}%`
					});
				} else items.push({
					type: "neutral",
					text: `动量平稳 ${momentum.toFixed(2)}%`
				});
			}
			if (us.current > 0 && uk.current > 0) {
				const avgChange = (us.changePercent + uk.changePercent) / 2;
				if (avgChange > .3) {
					score += 10;
					items.push({
						type: "positive",
						text: `外盘强势：COMEX +${us.changePercent.toFixed(2)}%，伦敦金 +${uk.changePercent.toFixed(2)}%`
					});
				} else if (avgChange > 0) {
					score += 5;
					items.push({
						type: "positive",
						text: `外盘偏强：COMEX +${us.changePercent.toFixed(2)}%`
					});
				} else if (avgChange < -.3) {
					score -= 10;
					items.push({
						type: "negative",
						text: `外盘走弱：COMEX ${us.changePercent.toFixed(2)}%`
					});
				} else if (avgChange < 0) {
					score -= 5;
					items.push({
						type: "negative",
						text: `外盘偏弱：COMEX ${us.changePercent.toFixed(2)}%`
					});
				} else items.push({
					type: "neutral",
					text: "外盘走势分化"
				});
			}
			if (dxy.current > 0) {
				if (dxy.change < -.2) {
					score += 8;
					items.push({
						type: "positive",
						text: `美元走弱(${dxy.change.toFixed(2)}%)，利好金价`
					});
				} else if (dxy.change > .2) {
					score -= 8;
					items.push({
						type: "negative",
						text: `美元走强(${dxy.change.toFixed(2)}%)，压制金价`
					});
				}
			}
			shortTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
			shortTerm.value.class = score >= 58 ? "bullish" : score <= 42 ? "bearish" : "neutral";
			shortTerm.value.label = score >= 65 ? "强势" : score >= 55 ? "偏多" : score <= 35 ? "弱势" : score <= 45 ? "偏空" : "震荡";
			if (score >= 65) shortTerm.value.suggestion = "趋势强劲，可轻仓顺势做多";
			else if (score >= 55) shortTerm.value.suggestion = "短线偏多，回调可试多";
			else if (score >= 45) shortTerm.value.suggestion = "震荡格局，观望为主";
			else if (score >= 35) shortTerm.value.suggestion = "短线偏弱，谨慎参与";
			else shortTerm.value.suggestion = "空头氛围，建议观望";
			shortAnalysis.value = items;
		};
		const analyzeMidTerm = (prices = null) => {
			const au = store.au9999;
			const dxy = store.dxy;
			let score = 50;
			const items = [];
			const priceArray = prices || (au.history || []).map((h) => h.price);
			if (priceArray.length >= 10) {
				const trendStrength = calculateTrendStrength(priceArray, 10);
				const firstAvg = priceArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
				const trend = (priceArray.slice(-5).reduce((a, b) => a + b, 0) / 5 - firstAvg) / firstAvg * 100;
				if (trend > .3 && trendStrength > 50) {
					score += 15;
					items.push({
						type: "positive",
						text: `上升趋势确立，强度${trendStrength.toFixed(0)}%，涨幅${trend.toFixed(2)}%`
					});
				} else if (trend > .3) {
					score += 8;
					items.push({
						type: "positive",
						text: `价格重心上移${trend.toFixed(2)}%，趋势形成中`
					});
				} else if (trend < -.3 && trendStrength > 50) {
					score -= 15;
					items.push({
						type: "negative",
						text: `下降趋势确立，强度${trendStrength.toFixed(0)}%`
					});
				} else if (trend < -.3) {
					score -= 8;
					items.push({
						type: "negative",
						text: `价格重心下移${Math.abs(trend).toFixed(2)}%`
					});
				} else items.push({
					type: "neutral",
					text: `震荡整理，趋势强度${trendStrength.toFixed(0)}%`
				});
			}
			if (priceArray.length >= 15) {
				const volatility = calculateStdDev(priceArray, 15) / (priceArray.reduce((a, b) => a + b, 0) / priceArray.length) * 100;
				if (volatility < .5) {
					score += 5;
					items.push({
						type: "positive",
						text: `波动率低(${volatility.toFixed(2)}%)，趋势稳定`
					});
				} else if (volatility > 1.5) {
					score -= 5;
					items.push({
						type: "negative",
						text: `波动率高(${volatility.toFixed(2)}%)，方向不明`
					});
				} else items.push({
					type: "neutral",
					text: `波动率正常(${volatility.toFixed(2)}%)`
				});
			}
			const rate = store.usdCny;
			if (rate.current > 0) if (rate.change < -.1) {
				score += 12;
				items.push({
					type: "positive",
					text: `人民币升值趋势，汇率${rate.current.toFixed(2)}`
				});
			} else if (rate.change > .1) {
				score -= 8;
				items.push({
					type: "negative",
					text: `人民币贬值，汇率${rate.current.toFixed(2)}`
				});
			} else items.push({
				type: "neutral",
				text: `汇率稳定${rate.current.toFixed(2)}`
			});
			if (dxy.current > 0) if (dxy.current < 103) {
				score += 10;
				items.push({
					type: "positive",
					text: `美元指数偏低(${dxy.current.toFixed(2)})，利好黄金`
				});
			} else if (dxy.current > 106) {
				score -= 10;
				items.push({
					type: "negative",
					text: `美元指数偏高(${dxy.current.toFixed(2)})，压制金价`
				});
			} else items.push({
				type: "neutral",
				text: `美元指数中性(${dxy.current.toFixed(2)})`
			});
			const spreadInfo = calculatePriceSpread();
			if (spreadInfo.spread !== 0) if (spreadInfo.status === "premium") items.push({
				type: "neutral",
				text: `国内溢价${spreadInfo.spread.toFixed(2)}%，需求旺盛`
			});
			else if (spreadInfo.status === "discount") {
				score += 5;
				items.push({
					type: "positive",
					text: `国内折价${Math.abs(spreadInfo.spread).toFixed(2)}%，配置价值高`
				});
			} else items.push({
				type: "neutral",
				text: `内外盘价差正常`
			});
			midTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
			midTerm.value.class = score >= 58 ? "bullish" : score <= 42 ? "bearish" : "neutral";
			midTerm.value.label = score >= 60 ? "偏多" : score <= 45 ? "偏空" : "震荡";
			if (score >= 60) midTerm.value.suggestion = "逢低分批建仓，目标1-4周";
			else if (score >= 50) midTerm.value.suggestion = "轻仓参与，回调加仓";
			else midTerm.value.suggestion = "观望等待，寻找更好入场点";
			midAnalysis.value = items;
		};
		const analyzeLongTerm = () => {
			const au = store.au9999;
			const rate = store.usdCny;
			const dxy = store.dxy;
			let score = 55;
			const items = [];
			const prices = (au.history || []).map((h) => h.price);
			items.push({
				type: "positive",
				text: "全球央行持续增持黄金，长期支撑金价"
			});
			score += 12;
			items.push({
				type: "positive",
				text: "地缘政治风险持续，避险属性凸显"
			});
			score += 8;
			if (dxy.current > 0) if (dxy.current < 102) {
				score += 10;
				items.push({
					type: "positive",
					text: `美元指数处于低位(${dxy.current.toFixed(2)})，利好黄金`
				});
			} else if (dxy.current > 108) {
				score -= 8;
				items.push({
					type: "negative",
					text: `美元指数高位(${dxy.current.toFixed(2)})，需关注回落信号`
				});
			} else items.push({
				type: "neutral",
				text: `美元指数中性区间(${dxy.current.toFixed(2)})`
			});
			if (rate.current > 0) if (rate.current < 7.1) {
				score += 8;
				items.push({
					type: "positive",
					text: `人民币汇率较低(${rate.current.toFixed(2)})，黄金性价比高`
				});
			} else if (rate.current > 7.3) {
				score -= 5;
				items.push({
					type: "neutral",
					text: `人民币汇率偏高(${rate.current.toFixed(2)})`
				});
			} else items.push({
				type: "neutral",
				text: `汇率稳定区间(${rate.current.toFixed(2)})`
			});
			if (prices.length >= 15) {
				const ma5 = calculateSMA(prices, 5);
				const ma15 = calculateSMA(prices, 15);
				if (ma5 && ma15) {
					if (ma5 > ma15 * 1.005) {
						score += 8;
						items.push({
							type: "positive",
							text: "长期均线多头排列，趋势向上"
						});
					} else if (ma5 < ma15 * .995) {
						score -= 5;
						items.push({
							type: "negative",
							text: "长期均线空头排列，承压运行"
						});
					}
				}
			}
			if (au.current > 0 && prices.length >= 10) {
				const high = Math.max(...prices);
				const low = Math.min(...prices);
				const position = (au.current - low) / (high - low);
				if (position < .3) {
					score += 8;
					items.push({
						type: "positive",
						text: `价格处于区间低位(${(position * 100).toFixed(0)}%)，配置价值高`
					});
				} else if (position > .7) {
					score -= 5;
					items.push({
						type: "neutral",
						text: `价格处于区间高位(${(position * 100).toFixed(0)}%)，建议分批配置`
					});
				} else items.push({
					type: "neutral",
					text: `价格处于区间中位(${(position * 100).toFixed(0)}%)`
				});
			}
			longTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
			longTerm.value.class = score >= 58 ? "bullish" : score <= 42 ? "bearish" : "neutral";
			longTerm.value.label = score >= 60 ? "看多" : score <= 45 ? "看空" : "中性";
			if (score >= 65) longTerm.value.suggestion = "建议定投配置，长期持有";
			else if (score >= 55) longTerm.value.suggestion = "逢低配置，长期持有";
			else longTerm.value.suggestion = "适度配置，控制仓位";
			longAnalysis.value = items;
		};
		const performAnalysis = (force = false) => {
			const currentHash = calculateDataHash();
			if (!force && currentHash === lastDataHash.value) return;
			lastDataHash.value = currentHash;
			const prices = (store.au9999.history || []).map((h) => h.price);
			const currentPrice = store.au9999.current;
			analyzeShortTerm(prices);
			analyzeMidTerm(prices);
			analyzeLongTerm();
			if (prices.length >= 10) {
				const analysis = analyzeTechnicalIndicators(prices, currentPrice);
				technicalIndicators.value = analysis.indicators;
				if (analysis.signals.length > 0 && shortAnalysis.value.length > 0) {
					const existingTexts = shortAnalysis.value.map((i) => i.text);
					const newSignals = analysis.signals.filter((s) => !existingTexts.includes(s.text)).slice(0, 3);
					shortAnalysis.value = [...shortAnalysis.value, ...newSignals];
				}
			}
		};
		watch(() => store.lastUpdate, () => {
			if (store.lastUpdate) performAnalysis();
		});
		onMounted(() => {
			performAnalysis();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$5, [_cache[6] || (_cache[6] = createStaticVNode("<div class=\"panel-header\" data-v-3862d4aa><div class=\"header-left\" data-v-3862d4aa><h3 class=\"panel-title\" data-v-3862d4aa><span class=\"title-icon\" data-v-3862d4aa>🤖</span> 数据分析 </h3><span class=\"panel-subtitle\" data-v-3862d4aa>DATA ANALYSIS</span></div></div>", 1)), createBaseVNode("div", _hoisted_2$5, [createBaseVNode("div", _hoisted_3$5, [
				createBaseVNode("div", { class: normalizeClass(["analysis-section short", shortTerm.value.class]) }, [
					createBaseVNode("div", _hoisted_4$4, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "term-info" }, [
						createBaseVNode("span", { class: "term-icon" }, "⚡"),
						createBaseVNode("span", { class: "term-title" }, "短线"),
						createBaseVNode("span", { class: "term-badge" }, "日内")
					], -1)), createBaseVNode("div", _hoisted_5$3, [createBaseVNode("span", _hoisted_6$3, toDisplayString(shortTerm.value.score), 1), createBaseVNode("span", { class: normalizeClass(["score-status", shortTerm.value.class]) }, toDisplayString(shortTerm.value.label), 3)])]),
					createBaseVNode("div", _hoisted_7$1, [createBaseVNode("div", _hoisted_8$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(shortAnalysis.value.slice(0, 8), (item, idx) => {
						return openBlock(), createElementBlock("div", {
							key: idx,
							class: "analysis-row"
						}, [createBaseVNode("span", { class: normalizeClass(["dot", item.type]) }, null, 2), createBaseVNode("span", _hoisted_9$1, toDisplayString(item.text), 1)]);
					}), 128))])]),
					createBaseVNode("div", _hoisted_10$1, [_cache[1] || (_cache[1] = createBaseVNode("span", { class: "suggestion-tag" }, "建议", -1)), createBaseVNode("span", { class: normalizeClass(["suggestion-text", shortTerm.value.class]) }, toDisplayString(shortTerm.value.suggestion), 3)])
				], 2),
				createBaseVNode("div", { class: normalizeClass(["analysis-section mid", midTerm.value.class]) }, [
					createBaseVNode("div", _hoisted_11$1, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "term-info" }, [
						createBaseVNode("span", { class: "term-icon" }, "📈"),
						createBaseVNode("span", { class: "term-title" }, "中线"),
						createBaseVNode("span", { class: "term-badge" }, "1-4周")
					], -1)), createBaseVNode("div", _hoisted_12$1, [createBaseVNode("span", _hoisted_13$1, toDisplayString(midTerm.value.score), 1), createBaseVNode("span", { class: normalizeClass(["score-status", midTerm.value.class]) }, toDisplayString(midTerm.value.label), 3)])]),
					createBaseVNode("div", _hoisted_14, [createBaseVNode("div", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(midAnalysis.value.slice(0, 8), (item, idx) => {
						return openBlock(), createElementBlock("div", {
							key: idx,
							class: "analysis-row"
						}, [createBaseVNode("span", { class: normalizeClass(["dot", item.type]) }, null, 2), createBaseVNode("span", _hoisted_16, toDisplayString(item.text), 1)]);
					}), 128))])]),
					createBaseVNode("div", _hoisted_17, [_cache[3] || (_cache[3] = createBaseVNode("span", { class: "suggestion-tag" }, "建议", -1)), createBaseVNode("span", { class: normalizeClass(["suggestion-text", midTerm.value.class]) }, toDisplayString(midTerm.value.suggestion), 3)])
				], 2),
				createBaseVNode("div", { class: normalizeClass(["analysis-section long", longTerm.value.class]) }, [
					createBaseVNode("div", _hoisted_18, [_cache[4] || (_cache[4] = createBaseVNode("div", { class: "term-info" }, [
						createBaseVNode("span", { class: "term-icon" }, "🎯"),
						createBaseVNode("span", { class: "term-title" }, "长线"),
						createBaseVNode("span", { class: "term-badge" }, "1-12月")
					], -1)), createBaseVNode("div", _hoisted_19, [createBaseVNode("span", _hoisted_20, toDisplayString(longTerm.value.score), 1), createBaseVNode("span", { class: normalizeClass(["score-status", longTerm.value.class]) }, toDisplayString(longTerm.value.label), 3)])]),
					createBaseVNode("div", _hoisted_21, [createBaseVNode("div", _hoisted_22, [(openBlock(true), createElementBlock(Fragment, null, renderList(longAnalysis.value.slice(0, 8), (item, idx) => {
						return openBlock(), createElementBlock("div", {
							key: idx,
							class: "analysis-row"
						}, [createBaseVNode("span", { class: normalizeClass(["dot", item.type]) }, null, 2), createBaseVNode("span", _hoisted_23, toDisplayString(item.text), 1)]);
					}), 128))])]),
					createBaseVNode("div", _hoisted_24, [_cache[5] || (_cache[5] = createBaseVNode("span", { class: "suggestion-tag" }, "建议", -1)), createBaseVNode("span", { class: normalizeClass(["suggestion-text", longTerm.value.class]) }, toDisplayString(longTerm.value.suggestion), 3)])
				], 2)
			])])]);
		};
	}
}, [["__scopeId", "data-v-3862d4aa"]]);
//#endregion
//#region src/components/SyncIndicator.vue
var _hoisted_1$4 = { class: "sync-icon" };
var _hoisted_2$4 = {
	key: 0,
	class: "sync-ring"
};
var _hoisted_3$4 = { class: "sync-info" };
var _hoisted_4$3 = { class: "sync-label" };
var _hoisted_5$2 = {
	key: 0,
	class: "sync-details"
};
var _hoisted_6$2 = {
	key: 0,
	class: "sync-stats"
};
var _hoisted_7 = { class: "stat-item" };
var _hoisted_8 = { class: "stat-value" };
var _hoisted_9 = { class: "stat-item" };
var _hoisted_10 = { class: "stat-value" };
var _hoisted_11 = {
	key: 1,
	class: "data-sources"
};
var _hoisted_12 = {
	key: 2,
	class: "last-update"
};
var _hoisted_13 = { class: "update-time" };
var SyncIndicator_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "SyncIndicator",
	props: {
		showDetails: {
			type: Boolean,
			default: false
		},
		showStats: {
			type: Boolean,
			default: false
		},
		connected: {
			type: Boolean,
			default: false
		},
		reconnecting: {
			type: Boolean,
			default: false
		},
		latency: {
			type: Number,
			default: 0
		},
		recordCount: {
			type: Number,
			default: 0
		},
		lastUpdate: {
			type: Number,
			default: 0
		},
		sourceStatus: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const props = __props;
		const syncStatus = computed(() => {
			if (props.reconnecting) return "connecting";
			if (props.connected) return "connected";
			return "offline";
		});
		const isSyncing = computed(() => props.reconnecting);
		const lastUpdateTime = computed(() => {
			if (!props.lastUpdate) return "";
			return new Date(props.lastUpdate).toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		});
		const latencyDisplay = computed(() => {
			if (props.latency === 0 || props.latency === null || props.latency === void 0) return "--";
			return props.latency;
		});
		const statusLabel = computed(() => {
			switch (syncStatus.value) {
				case "offline": return "离线";
				case "connecting": return "连接中...";
				case "connected": return "实时同步";
				case "error": return "连接错误";
				default: return "未知";
			}
		});
		const syncDetails = computed(() => {
			if (syncStatus.value === "connected") return `${Object.values(props.sourceStatus || {}).filter((s) => s === "ok").length}/3 数据源正常`;
			else if (syncStatus.value === "error") return "正在尝试重新连接";
			else if (syncStatus.value === "offline") return "正在使用离线数据";
			return "";
		});
		const getSourceStatus = (source) => {
			return props.sourceStatus?.[source] || "ok";
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["sync-indicator", syncStatus.value]) }, [
				createBaseVNode("div", _hoisted_1$4, [createBaseVNode("div", { class: normalizeClass(["sync-dot", { active: isSyncing.value }]) }, null, 2), isSyncing.value ? (openBlock(), createElementBlock("div", _hoisted_2$4)) : createCommentVNode("", true)]),
				createBaseVNode("div", _hoisted_3$4, [createBaseVNode("span", _hoisted_4$3, toDisplayString(statusLabel.value), 1), __props.showDetails ? (openBlock(), createElementBlock("span", _hoisted_5$2, toDisplayString(syncDetails.value), 1)) : createCommentVNode("", true)]),
				__props.showStats ? (openBlock(), createElementBlock("div", _hoisted_6$2, [createBaseVNode("div", _hoisted_7, [_cache[0] || (_cache[0] = createBaseVNode("span", { class: "stat-label" }, "延迟", -1)), createBaseVNode("span", _hoisted_8, toDisplayString(latencyDisplay.value) + "ms", 1)]), createBaseVNode("div", _hoisted_9, [_cache[1] || (_cache[1] = createBaseVNode("span", { class: "stat-label" }, "缓存", -1)), createBaseVNode("span", _hoisted_10, toDisplayString(__props.recordCount), 1)])])) : createCommentVNode("", true),
				__props.showStats ? (openBlock(), createElementBlock("div", _hoisted_11, [
					createBaseVNode("div", { class: normalizeClass(["source-item", getSourceStatus("sina")]) }, [..._cache[2] || (_cache[2] = [createBaseVNode("span", { class: "source-dot" }, null, -1), createBaseVNode("span", { class: "source-name" }, "新浪", -1)])], 2),
					createBaseVNode("div", { class: normalizeClass(["source-item", getSourceStatus("eastmoney")]) }, [..._cache[3] || (_cache[3] = [createBaseVNode("span", { class: "source-dot" }, null, -1), createBaseVNode("span", { class: "source-name" }, "东财", -1)])], 2),
					createBaseVNode("div", { class: normalizeClass(["source-item", getSourceStatus("gate")]) }, [..._cache[4] || (_cache[4] = [createBaseVNode("span", { class: "source-dot" }, null, -1), createBaseVNode("span", { class: "source-name" }, "Gate", -1)])], 2)
				])) : createCommentVNode("", true),
				__props.showDetails && lastUpdateTime.value ? (openBlock(), createElementBlock("div", _hoisted_12, [_cache[5] || (_cache[5] = createBaseVNode("span", { class: "update-label" }, "更新于", -1)), createBaseVNode("span", _hoisted_13, toDisplayString(lastUpdateTime.value), 1)])) : createCommentVNode("", true)
			], 2);
		};
	}
}, [["__scopeId", "data-v-b5449c34"]]);
//#endregion
//#region src/components/StatsSkeleton.vue
var _hoisted_1$3 = { class: "stats-skeleton" };
var _hoisted_2$3 = { class: "skeleton-header" };
var _hoisted_3$3 = { class: "skeleton-price" };
var _hoisted_4$2 = { class: "skeleton-change" };
var StatsSkeleton_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "StatsSkeleton",
	props: { count: {
		type: Number,
		default: 6
	} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.count, (i) => {
				return openBlock(), createElementBlock("div", {
					key: i,
					class: "stat-card-skeleton"
				}, [
					createBaseVNode("div", _hoisted_2$3, [createVNode(Skeleton_default, {
						width: "60px",
						height: "10px"
					}), createVNode(Skeleton_default, {
						width: "40px",
						height: "16px",
						radius: "4px"
					})]),
					createBaseVNode("div", _hoisted_3$3, [createVNode(Skeleton_default, {
						width: "100px",
						height: "28px"
					})]),
					createBaseVNode("div", _hoisted_4$2, [createVNode(Skeleton_default, {
						width: "50px",
						height: "12px"
					}), createVNode(Skeleton_default, {
						width: "60px",
						height: "18px",
						radius: "10px"
					})])
				]);
			}), 128))]);
		};
	}
}, [["__scopeId", "data-v-7fc00438"]]);
//#endregion
//#region src/components/ChartsSkeleton.vue
var _hoisted_1$2 = { class: "charts-skeleton" };
var _hoisted_2$2 = { class: "chart-header-skeleton" };
var _hoisted_3$2 = { class: "price-info-skeleton" };
var _hoisted_4$1 = { class: "chart-body-skeleton" };
var _hoisted_5$1 = {
	viewBox: "0 0 300 150",
	class: "skeleton-line"
};
var _hoisted_6$1 = ["d"];
var ChartsSkeleton_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "ChartsSkeleton",
	props: { count: {
		type: Number,
		default: 3
	} },
	setup(__props) {
		const generatePath = () => {
			const points = [];
			let y = 75;
			for (let x = 0; x <= 300; x += 10) {
				y += (Math.random() - .5) * 20;
				y = Math.max(20, Math.min(130, y));
				points.push(`${x},${y}`);
			}
			return `M ${points.join(" L ")}`;
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.count, (i) => {
				return openBlock(), createElementBlock("div", {
					key: i,
					class: "chart-skeleton"
				}, [createBaseVNode("div", _hoisted_2$2, [createVNode(Skeleton_default, {
					width: "100px",
					height: "14px"
				}), createBaseVNode("div", _hoisted_3$2, [createVNode(Skeleton_default, {
					width: "80px",
					height: "16px"
				}), createVNode(Skeleton_default, {
					width: "100px",
					height: "12px"
				})])]), createBaseVNode("div", _hoisted_4$1, [(openBlock(), createElementBlock("svg", _hoisted_5$1, [createBaseVNode("path", {
					d: generatePath(),
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "1.5",
					opacity: "0.3"
				}, null, 8, _hoisted_6$1)]))])]);
			}), 128))]);
		};
	}
}, [["__scopeId", "data-v-c3fb1f15"]]);
//#endregion
//#region src/components/ErrorToast.vue
var _hoisted_1$1 = {
	key: 0,
	class: "error-toast"
};
var _hoisted_2$1 = { class: "toast-content" };
var _hoisted_3$1 = { class: "toast-message" };
var _sfc_main$1 = {
	__name: "ErrorToast",
	props: { error: {
		type: String,
		default: ""
	} },
	emits: ["retry", "dismiss"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = ref(false);
		let dismissTimer = null;
		watch(() => props.error, (newError) => {
			if (newError) {
				visible.value = true;
				if (dismissTimer) clearTimeout(dismissTimer);
				dismissTimer = setTimeout(() => {
					visible.value = false;
					emit("dismiss");
				}, TOAST_AUTO_DISMISS);
			} else visible.value = false;
		});
		const handleRetry = () => {
			if (dismissTimer) clearTimeout(dismissTimer);
			visible.value = false;
			emit("retry");
		};
		const handleClose = () => {
			if (dismissTimer) clearTimeout(dismissTimer);
			visible.value = false;
			emit("dismiss");
		};
		onUnmounted(() => {
			if (dismissTimer) clearTimeout(dismissTimer);
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, { name: "toast" }, {
				default: withCtx(() => [visible.value && __props.error ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
					_cache[3] || (_cache[3] = createBaseVNode("div", { class: "toast-icon" }, [createBaseVNode("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2"
					}, [
						createBaseVNode("circle", {
							cx: "12",
							cy: "12",
							r: "10"
						}),
						createBaseVNode("line", {
							x1: "12",
							y1: "8",
							x2: "12",
							y2: "12"
						}),
						createBaseVNode("line", {
							x1: "12",
							y1: "16",
							x2: "12.01",
							y2: "16"
						})
					])], -1)),
					createBaseVNode("div", _hoisted_2$1, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "toast-title" }, "数据获取失败", -1)), createBaseVNode("div", _hoisted_3$1, toDisplayString(__props.error), 1)]),
					createBaseVNode("button", {
						class: "toast-retry",
						onClick: handleRetry
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2"
					}, [createBaseVNode("path", { d: "M1 4v6h6" }), createBaseVNode("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })], -1), createBaseVNode("span", null, "重试", -1)])]),
					createBaseVNode("button", {
						class: "toast-close",
						onClick: handleClose
					}, [..._cache[2] || (_cache[2] = [createBaseVNode("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2"
					}, [createBaseVNode("line", {
						x1: "18",
						y1: "6",
						x2: "6",
						y2: "18"
					}), createBaseVNode("line", {
						x1: "6",
						y1: "6",
						x2: "18",
						y2: "18"
					})], -1)])])
				])) : createCommentVNode("", true)]),
				_: 1
			});
		};
	}
};
//#endregion
//#region src/App.vue
var _hoisted_1 = { class: "app-main" };
var _hoisted_2 = { class: "content-grid" };
var _hoisted_3 = { class: "main-column" };
var _hoisted_4 = { class: "section-card analysis-section" };
var _hoisted_5 = { class: "side-column" };
var _hoisted_6 = { class: "section-card news-section-main" };
var _sfc_main = {
	__name: "App",
	setup(__props) {
		const store = useGoldStore();
		const isDataLoaded = ref(false);
		watch(() => store.lastUpdate, (val) => {
			if (val && !isDataLoaded.value) isDataLoaded.value = true;
		});
		const handleRetry = async () => {
			await store.fetchAllData();
		};
		const clearError = () => {
			store.error = null;
		};
		onMounted(async () => {
			store.initWebSocket();
			await store.fetchAllData();
			isDataLoaded.value = true;
			await store.updateCacheStats();
		});
		onUnmounted(() => {
			store.disconnectWebSocket();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["app", { "data-loaded": isDataLoaded.value }]) }, [
				createVNode(_sfc_main$13, { "data-source": unref(store).dataSource }, {
					actions: withCtx(() => [createVNode(SyncIndicator_default, {
						"show-details": true,
						"show-stats": true,
						connected: unref(store).wsConnected,
						reconnecting: unref(store).wsReconnecting,
						latency: unref(store).syncStats.latency,
						"record-count": unref(store).syncStats.recordCount,
						"last-update": unref(store).syncStats.lastUpdate,
						"source-status": unref(store).sourceStatus
					}, null, 8, [
						"connected",
						"reconnecting",
						"latency",
						"record-count",
						"last-update",
						"source-status"
					]), createVNode(SettingsPanel_default, { "polling-mode": unref(store).pollingMode }, null, 8, ["polling-mode"])]),
					_: 1
				}, 8, ["data-source"]),
				createBaseVNode("main", _hoisted_1, [!isDataLoaded.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(StatsSkeleton_default, { count: 6 }), createVNode(ChartsSkeleton_default, { count: 2 })], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_sfc_main$11, {
					au9999: unref(store).au9999,
					"us-futures": unref(store).usFutures,
					"uk-futures": unref(store).ukFutures,
					paxg: unref(store).paxg,
					"usd-cny": unref(store).usdCny,
					dxy: unref(store).dxy,
					"price-flash": unref(store).priceFlash
				}, null, 8, [
					"au9999",
					"us-futures",
					"uk-futures",
					"paxg",
					"usd-cny",
					"dxy",
					"price-flash"
				]), createVNode(_sfc_main$9)], 64)), createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("section", _hoisted_4, [createVNode(AnalysisPanel_default)])]), createBaseVNode("div", _hoisted_5, [createBaseVNode("section", _hoisted_6, [createVNode(NewsPanel_default, { "refresh-interval": 3e5 })])])])]),
				createVNode(_sfc_main$1, {
					error: unref(store).error || "",
					onRetry: handleRetry,
					onDismiss: clearError
				}, null, 8, ["error"])
			], 2);
		};
	}
};
//#endregion
//#region src/main.js
var errorStats = {
	total: 0,
	byType: /* @__PURE__ */ new Map(),
	recentErrors: []
};
function classifyError(error) {
	if (error?.message) {
		const msg = error.message.toLowerCase();
		if (msg.includes("network") || msg.includes("fetch")) return "network";
		if (msg.includes("timeout")) return "timeout";
		if (msg.includes("syntax")) return "syntax";
		if (msg.includes("type")) return "type";
		if (msg.includes("reference")) return "reference";
	}
	return "unknown";
}
function recordError(error, type = "vue") {
	errorStats.total++;
	const errorType = classifyError(error);
	errorStats.byType.set(errorType, (errorStats.byType.get(errorType) || 0) + 1);
	errorStats.recentErrors.push({
		type,
		errorType,
		message: error?.message || String(error),
		stack: error?.stack,
		timestamp: Date.now()
	});
	if (errorStats.recentErrors.length > 50) errorStats.recentErrors.shift();
}
function getUserFriendlyMessage(error, type) {
	const errorMsg = error?.message || String(error);
	switch (type) {
		case "unhandledRejection":
			if (errorMsg.includes("NetworkError") || errorMsg.includes("fetch")) return "网络请求失败，请检查网络连接";
			return "异步操作失败，请重试";
		case "vue":
			if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) return "数据加载失败，请检查网络";
			if (errorMsg.includes("timeout")) return "请求超时，请稍后重试";
			return "组件加载出现问题";
		default: return "应用出现异常";
	}
}
function setupGlobalErrorHandler(app) {
	app.config.errorHandler = (err, instance, info) => {
		console.error("[Vue Error]", {
			error: err,
			component: instance?.$options?.name || "匿名组件",
			info
		});
		recordError(err, "vue");
		showUserNotification(getUserFriendlyMessage(err, "vue"), "error");
	};
	window.addEventListener("unhandledrejection", (event) => {
		console.error("[Unhandled Rejection]", event.reason);
		recordError(event.reason, "unhandledRejection");
		showUserNotification(getUserFriendlyMessage(event.reason, "unhandledRejection"), "warning");
	});
	window.addEventListener("error", (event) => {
		if (event.error) {
			console.error("[Global Error]", {
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error
			});
			recordError(event.error, "global");
		}
	});
	window.addEventListener("error", (event) => {
		if (event.target !== window) {
			console.error("[Resource Error]", {
				tagName: event.target.tagName,
				src: event.target.src || event.target.href,
				type: event.type
			});
			recordError(/* @__PURE__ */ new Error(`Resource load failed: ${event.target.src || event.target.href}`), "resource");
		}
	}, true);
}
function showUserNotification(message, type = "info") {
	const notification = document.createElement("div");
	notification.className = `global-notification global-notification--${type}`;
	notification.textContent = message;
	Object.assign(notification.style, {
		position: "fixed",
		top: "20px",
		right: "20px",
		padding: "12px 20px",
		background: type === "error" ? "rgba(239, 68, 68, 0.9)" : type === "warning" ? "rgba(251, 191, 36, 0.9)" : "rgba(16, 185, 129, 0.9)",
		color: "#fff",
		borderRadius: "8px",
		fontSize: "14px",
		fontWeight: "500",
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
		zIndex: "10000",
		animation: "notification-slide-in 0.3s ease-out",
		maxWidth: "300px",
		wordBreak: "break-word"
	});
	if (!document.getElementById("notification-styles")) {
		const style = document.createElement("style");
		style.id = "notification-styles";
		style.textContent = `
      @keyframes notification-slide-in {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes notification-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
		document.head.appendChild(style);
	}
	document.body.appendChild(notification);
	setTimeout(() => {
		notification.style.animation = "notification-slide-out 0.3s ease-out forwards";
		setTimeout(() => notification.remove(), 300);
	}, 3e3);
}
var app = createApp(_sfc_main);
var pinia = createPinia();
setupGlobalErrorHandler(app);
app.directive("loading", {
	mounted(el, binding) {
		if (binding.value) {
			el.style.position = "relative";
			const overlay = document.createElement("div");
			overlay.className = "v-loading-overlay";
			overlay.innerHTML = "<div class=\"v-loading-spinner\"></div>";
			el.appendChild(overlay);
		}
	},
	updated(el, binding) {
		const overlay = el.querySelector(".v-loading-overlay");
		if (binding.value && !overlay) {
			el.style.position = "relative";
			const newOverlay = document.createElement("div");
			newOverlay.className = "v-loading-overlay";
			newOverlay.innerHTML = "<div class=\"v-loading-spinner\"></div>";
			el.appendChild(newOverlay);
		} else if (!binding.value && overlay) overlay.remove();
	}
});
app.use(pinia);
app.mount("#app");
//#endregion
