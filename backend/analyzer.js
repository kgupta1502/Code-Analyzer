// Simple heuristic code complexity analyzer
// Produces fields expected by the frontend page:
// timeComplexity, timeComplexityType, timeExplanation
// spaceComplexity, spaceComplexityType, spaceExplanation
// codeRating (1..5)

const superscript = (s) => s.replace(/\^2/g, '<sup>2</sup>');

const complexityMappings = {
  constant: { bigO: 'O(1)', label: 'constant' },
  logarithmic: { bigO: 'O(log n)', label: 'logarithmic' },
  linear: { bigO: 'O(n)', label: 'linear' },
  linearithmic: { bigO: 'O(n log n)', label: 'linearithmic' },
  quadratic: { bigO: 'O(n^2)', label: 'quadratic' },
};

function scoreComplexity({ nestedLoops, loops, recursion, sortCalls, logCalls }) {
  // Very rough heuristic ordering by typical growth
  if (nestedLoops > 0) return 'quadratic';
  if (sortCalls > 0 || (loops > 0 && logCalls > 0)) return 'linearithmic';
  if (recursion > 0 && loops === 0) return 'linear';
  if (loops > 0) return 'linear';
  if (logCalls > 0) return 'logarithmic';
  return 'constant';
}

function estimateSpace({ arrays, maps, sets, newObjAllocs, recursion }) {
  if (arrays + maps + sets + newObjAllocs >= 2) return 'linear';
  if (recursion > 0) return 'linear';
  return 'constant';
}

function explainTime(type) {
  switch (type) {
    case 'quadratic':
      return 'Detected nested iteration patterns suggesting O(n^2) behavior.';
    case 'linearithmic':
      return 'Combination of iteration and logarithmic operations (e.g., sorting or binary search) suggests O(n log n).';
    case 'linear':
      return 'Detected single-pass iteration indicating O(n) time.';
    case 'logarithmic':
      return 'Found logarithmic-like operations (e.g., division by 2, binary search) suggesting O(log n).';
    default:
      return 'No heavy loops or recursion detected; likely O(1) in the dominant path.';
  }
}

function explainSpace(type) {
  switch (type) {
    case 'linear':
      return 'Data structures or recursion depth scale with input size, yielding O(n) space.';
    default:
      return 'No significant auxiliary structures; likely O(1) extra space.';
  }
}

function rateCode(timeType, spaceType) {
  // Simple rating: lower time/space gets higher rating
  const order = ['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic'];
  const t = order.indexOf(timeType);
  const s = order.indexOf(spaceType);
  const raw = 5 - Math.max(t, s);
  return Math.min(5, Math.max(1, raw));
}

export function analyze(code, model) {
  const text = String(code);

  // Patterns to look for (lang-agnostic-ish)
  const patterns = {
    loop: /\b(for|while|foreach|forEach)\b|\bfor\s*\(|while\s*\(|forEach\s*\(/gi,
    nestedLoop: /(for|while)\s*\([^)]*\)\s*{[^{}]*(for|while)\s*\([^)]*\)/gis,
    recursion: /\bfunction\s+(\w+)\b[\s\S]*?\1\s*\(|\b(\w+)\s*\([^)]*\)\s*{[\s\S]*?\b\2\s*\(/gis,
    sortCalls: /\.(sort|sorted)\s*\(|\bqsort\b|std::sort\b|Collections\.sort\b/gi,
    logCalls: /\blog2?\s*\(|\bMath\.log2?\s*\(|\bbinarySearch\s*\(/gi,
    arrays: /\[\s*\]|new\s+Array\b|\bvector<|ArrayList<|\bstd::vector\b/gi,
    maps: /Map\b|HashMap\b|unordered_map\b|std::map\b/gi,
    sets: /Set\b|HashSet\b|std::set\b/gi,
    newObj: /new\s+\w+\s*\(|\{\s*\}/g,
  };

  // Heuristic detection for logarithmic-time loops (e.g., binary search / halving)
  // Looks for typical binary search structure and halving updates even without explicit 'binarySearch' calls.
  function detectLogarithmicLoop(t) {
    // Strategy: find loop bodies and look for halving patterns or classic mid/bounds updates.
    // 1) Check loop bodies for halving expressions (i = i/2, i /= 2, i >>= 1, >> 1, / 2)
    // 2) Check for mid calculation + low/high updates anywhere in the text
    try {
      const loopBodyRegex = /(?:for|while)[^{]*\{([\s\S]*?)\}/gi;
      let m;
      const halvingRegex = /\b([a-zA-Z_$][\w$]*)\s*(?:=|\/=)\s*\1\s*\/\s*2|\b([a-zA-Z_$][\w$]*)\s*\/=\s*2|>>=\s*1|>>\s*1|\bMath\.floor\([^)]*\/\s*2\)/i;
  const midCalcRegex = /\bmid\b\s*=\s*[^;\n]*/i;
  // include common bound variable names: low/high/left/right AND start/end
  const boundsNames = /\b(low|left|lo|high|right|hi|start|end)\b/i;

      while ((m = loopBodyRegex.exec(t)) !== null) {
        const body = m[1] || '';
        if (halvingRegex.test(body)) return true;
        if (midCalcRegex.test(body) && boundsNames.test(body)) return true;
      }

      // 2) mid calc + bound moves somewhere in the file
  const midLine = /mid\s*=\s*[^;\n]*/i;
  // recognize start/end updates as bound moves as well
  const moveBounds = /\b(start|low|left|lo)\s*=\s*mid\s*\+\s*1|\b(end|high|right|hi)\s*=\s*mid\s*-\s*1/i;
      if (midLine.test(t) && moveBounds.test(t)) return true;

      // 3) for-loop style halving in the header: for (...; ...; i = Math.floor(i/2))
      const forHalving = /for\s*\([^)]*;[^;]*;[^)]*(?:\/\s*2|>>\s*1|>>=\s*1|Math\.floor\([^)]*\/\s*2\))/i;
      if (forHalving.test(t)) return true;
    } catch (e) {
      // fall back to conservative false on any regex error
    }
    return false;
  }

  const loops = (text.match(patterns.loop) || []).length;
  const nestedLoops = (text.match(patterns.nestedLoop) || []).length;
  const recursion = (text.match(patterns.recursion) || []).length;
  const sortCalls = (text.match(patterns.sortCalls) || []).length;
  const logCalls = (text.match(patterns.logCalls) || []).length;
  const arrays = (text.match(patterns.arrays) || []).length;
  const maps = (text.match(patterns.maps) || []).length;
  const sets = (text.match(patterns.sets) || []).length;
  const newObjAllocs = (text.match(patterns.newObj) || []).length;

  let timeType = scoreComplexity({ nestedLoops, loops, recursion, sortCalls, logCalls });

  // Override to logarithmic when we strongly detect a binary-search/halving pattern
  if (nestedLoops === 0 && loops > 0 && detectLogarithmicLoop(text)) {
    timeType = 'logarithmic';
  }
  const spaceType = estimateSpace({ arrays, maps, sets, newObjAllocs, recursion });

  const time = complexityMappings[timeType];
  const space = complexityMappings[spaceType] || complexityMappings.constant;

  const result = {
    timeComplexity: superscript(time.bigO),
    timeComplexityType: time.label,
    timeExplanation: explainTime(timeType),
    spaceComplexity: superscript(space.bigO),
    spaceComplexityType: space.label,
    spaceExplanation: explainSpace(spaceType),
    codeRating: rateCode(timeType, spaceType),
  };

  return result;
}
