import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause } from 'lucide-react';

const LeetCodeAnimation = () => {
  // Example: fruits = [[2,8],[6,3],[8,6]], startPos = 5, k = 4
  const [fruits, setFruits] = useState([[2,8],[6,3],[8,6]]);
  const [startPos, setStartPos] = useState(5);
  const [k, setK] = useState(4);
  const [fruitsInput, setFruitsInput] = useState('[[2,8],[6,3],[8,6]]');
  const [startPosInput, setStartPosInput] = useState('5');
  const [kInput, setKInput] = useState('4');
  
  // const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [strategy, setStrategy] = useState('right-first'); // 'right-first' or 'left-first'
  const [stepIndex, setStepIndex] = useState(0);
  
  const updateInputs = () => {
    try {
      const parsedFruits = JSON.parse(fruitsInput);
      if (Array.isArray(parsedFruits) && parsedFruits.length > 0 && 
          Array.isArray(parsedFruits[0]) && parsedFruits[0].length === 2) {
        setFruits(parsedFruits);
      }
    } catch (e) {
      // Invalid JSON, keep current fruits
    }
    
    const newStartPos = parseInt(startPosInput);
    if (!isNaN(newStartPos) && newStartPos >= 0) {
      setStartPos(newStartPos);
    }
    
    const newK = parseInt(kInput);
    if (!isNaN(newK) && newK >= 0) {
      setK(newK);
    }
    
    // Reset animation
    setStepIndex(0);
    setIsPlaying(false);
  };
  
  // Calculate solution
  const maxRight = Math.max(startPos, fruits[fruits.length - 1][0]);
  const amounts = new Array(maxRight + 1).fill(0);
  for (const [position, amount] of fruits) {
    amounts[position] = amount;
  }
  
  // Prefix sums
  const prefix = [0];
  for (let i = 0; i < amounts.length; i++) {
    prefix.push(prefix[prefix.length - 1] + amounts[i]);
  }
  
  const getFruits = (leftSteps: number, rightSteps: number) => {
    const l = Math.max(0, startPos - leftSteps);
    const r = Math.min(maxRight, startPos + rightSteps);
    return prefix[r + 1] - prefix[l];
  };
  
  // Generate all steps for both strategies
  const rightFirstSteps = [];
  for (let rightSteps = 0; rightSteps <= Math.min(maxRight - startPos, k); rightSteps++) {
    const leftSteps = Math.max(0, k - 2 * rightSteps);
    const fruits_collected = getFruits(leftSteps, rightSteps);
    rightFirstSteps.push({
      rightSteps,
      leftSteps,
      fruits: fruits_collected,
      range: [Math.max(0, startPos - leftSteps), Math.min(maxRight, startPos + rightSteps)]
    });
  }
  
  const leftFirstSteps = [];
  for (let leftSteps = 0; leftSteps <= Math.min(startPos, k); leftSteps++) {
    const rightSteps = Math.max(0, k - 2 * leftSteps);
    const fruits_collected = getFruits(leftSteps, rightSteps);
    leftFirstSteps.push({
      leftSteps,
      rightSteps,
      fruits: fruits_collected,
      range: [Math.max(0, startPos - leftSteps), Math.min(maxRight, startPos + rightSteps)]
    });
  }
  
  const allSteps = strategy === 'right-first' ? rightFirstSteps : leftFirstSteps;
  const currentStepData = allSteps[stepIndex] || allSteps[0];
  const maxFruits = Math.max(...rightFirstSteps.map(s => s.fruits), ...leftFirstSteps.map(s => s.fruits));
  
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (stepIndex < allSteps.length - 1) {
          setStepIndex(stepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, stepIndex, allSteps.length]);
  
  const resetAnimation = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };
  
  const nextStep = () => {
    if (stepIndex < allSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };
  
  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };
  
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">LeetCode 2106: Maximum Fruits Harvested</h1>
        <p className="text-center text-gray-600 mb-6">Interactive Step-by-Step Animation</p>
        
        {/* Problem Setup */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Problem Setup</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fruits (format: [[position, amount], ...])
              </label>
              <input
                type="text"
                value={fruitsInput}
                onChange={(e) => setFruitsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="[[2,8],[6,3],[8,6]]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Position
                </label>
                <input
                  type="number"
                  value={startPosInput}
                  onChange={(e) => setStartPosInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Steps
                </label>
                <input
                  type="number"
                  value={kInput}
                  onChange={(e) => setKInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="4"
                  min="0"
                />
              </div>
            </div>
            
            <button
              onClick={updateInputs}
              className="w-full md:w-auto px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium"
            >
              Update & Reset Animation
            </button>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <div><strong>Current Values:</strong></div>
              <div><strong>Fruits:</strong> {JSON.stringify(fruits)}</div>
              <div><strong>Start Position:</strong> {startPos}</div>
              <div><strong>Max Steps:</strong> {k}</div>
            </div>
          </div>
        </div>
        
        {/* Strategy Selector */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">Strategy</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {setStrategy('right-first'); setStepIndex(0);}}
              className={`px-4 py-2 rounded-lg font-medium ${
                strategy === 'right-first' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Go Right First
            </button>
            <button
              onClick={() => {setStrategy('left-first'); setStepIndex(0);}}
              className={`px-4 py-2 rounded-lg font-medium ${
                strategy === 'left-first' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Go Left First
            </button>
          </div>
        </div>
        
        {/* Current Step Info */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">Current Step Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="font-semibold text-blue-800">Left Steps</div>
              <div className="text-2xl font-bold text-blue-600">{currentStepData.leftSteps}</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="font-semibold text-purple-800">Right Steps</div>
              <div className="text-2xl font-bold text-purple-600">{currentStepData.rightSteps}</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <div className="font-semibold text-orange-800">Total Steps</div>
              <div className="text-2xl font-bold text-orange-600">{currentStepData.leftSteps + 2 * Math.min(currentStepData.leftSteps, currentStepData.rightSteps)}</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="font-semibold text-green-800">Fruits Collected</div>
              <div className="text-2xl font-bold text-green-600">{currentStepData.fruits}</div>
              {currentStepData.fruits === maxFruits && <div className="text-xs text-green-700 font-medium">MAXIMUM!</div>}
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">Step Calculation:</div>
            <div className="text-sm text-gray-600">
              {strategy === 'right-first' ? (
                <>Go right {currentStepData.rightSteps} steps + return {currentStepData.rightSteps} steps + go left {currentStepData.leftSteps} steps = {currentStepData.rightSteps * 2 + currentStepData.leftSteps} total steps</>
              ) : (
                <>Go left {currentStepData.leftSteps} steps + return {currentStepData.leftSteps} steps + go right {currentStepData.rightSteps} steps = {currentStepData.leftSteps * 2 + currentStepData.rightSteps} total steps</>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Range covered: [{currentStepData.range[0]}, {currentStepData.range[1]}]
            </div>
          </div>
        </div>
        
        {/* Visual Grid */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Visual Representation</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-10 gap-1 text-center">
              {Array.from({length: maxRight + 1}, (_, i) => {
                const isStart = i === startPos;
                const hasFruit = amounts[i] > 0;
                const isInRange = i >= currentStepData.range[0] && i <= currentStepData.range[1];
                
                return (
                  <div key={i} className="relative">
                    <div className="text-xs text-gray-400 mb-1">{i}</div>
                    <div 
                      className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isStart 
                          ? 'bg-red-500 text-white border-red-600' 
                          : isInRange
                            ? 'bg-green-200 border-green-400 text-green-800'
                            : hasFruit
                              ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                              : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}
                    >
                      {isStart ? 'S' : amounts[i] || '0'}
                    </div>
                    {isStart && <div className="text-xs mt-1 text-red-600 font-medium">START</div>}
                    {hasFruit && !isStart && <div className="text-xs mt-1 text-yellow-600">🍎</div>}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Start Position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span>Reachable Range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
                <span>Has Fruits</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-center items-center gap-4 mb-4">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={nextStep}
              disabled={stepIndex === allSteps.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
            
            <button
              onClick={resetAnimation}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Step {stepIndex + 1} of {allSteps.length} | Strategy: {strategy === 'right-first' ? 'Go Right First' : 'Go Left First'}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{width: `${((stepIndex + 1) / allSteps.length) * 100}%`}}
            ></div>
          </div>
        </div>
        
        {/* Algorithm Explanation */}
        <div className="bg-white rounded-lg p-4 mt-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">Algorithm Explanation</h2>
          <div className="space-y-3 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-bold text-blue-800 mb-2">🔑 Key Insight: Pre-Commitment Strategy</h3>
              <p className="text-blue-700">
                We <strong>DON'T</strong> decide step-by-step whether to go back. Instead, we <strong>pre-commit</strong> to a complete strategy before moving!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Strategy 1: "Go Right First"</h4>
                <div className="text-purple-700 space-y-1">
                  <div>1. Decide: "I'll go right R steps"</div>
                  <div>2. Go right R steps (collect fruits)</div>
                  <div>3. Return to start (R steps back)</div>
                  <div>4. Go left with remaining k-2R steps</div>
                  <div className="text-xs text-purple-600 mt-2">
                    <strong>Total:</strong> R + R + (k-2R) = k steps
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Strategy 2: "Go Left First"</h4>
                <div className="text-green-700 space-y-1">
                  <div>1. Decide: "I'll go left L steps"</div>
                  <div>2. Go left L steps (collect fruits)</div>
                  <div>3. Return to start (L steps back)</div>
                  <div>4. Go right with remaining k-2L steps</div>
                  <div className="text-xs text-green-600 mt-2">
                    <strong>Total:</strong> L + L + (k-2L) = k steps
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-bold text-yellow-800 mb-2">🤔 Why Pre-Commit?</h3>
              <div className="text-yellow-700 space-y-2">
                <p><strong>Optimal Substructure:</strong> The best solution always follows one of these two patterns - there's no benefit to "partial returns" or complex zigzag patterns.</p>
                <p><strong>Proof:</strong> Any zigzag path can be improved by collecting all fruits in a contiguous range around the start position.</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <h3 className="font-bold text-red-800 mb-2">❌ What We DON'T Do</h3>
              <div className="text-red-700 space-y-1">
                <div>• Step-by-step decisions ("should I go back now?")</div>
                <div>• Partial returns or multiple direction changes</div>
                <div>• Dynamic decision making during movement</div>
                <div>• Complex path planning</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Current Example Breakdown:</h3>
              <div className="text-gray-700 text-sm">
                {strategy === 'right-first' ? (
                  <div className="space-y-1">
                    <div><strong>Step 1:</strong> Decide to go right {currentStepData.rightSteps} steps</div>
                    <div><strong>Step 2:</strong> Move right and collect fruits from position {startPos} to {startPos + currentStepData.rightSteps}</div>
                    <div><strong>Step 3:</strong> Return to start (uses {currentStepData.rightSteps} more steps)</div>
                    <div><strong>Step 4:</strong> Go left {currentStepData.leftSteps} steps and collect fruits from position {startPos - currentStepData.leftSteps} to {startPos - 1}</div>
                    <div className="mt-2 text-xs">
                      <strong>Total range covered:</strong> [{currentStepData.range[0]}, {currentStepData.range[1]}]
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div><strong>Step 1:</strong> Decide to go left {currentStepData.leftSteps} steps</div>
                    <div><strong>Step 2:</strong> Move left and collect fruits from position {startPos - currentStepData.leftSteps} to {startPos}</div>
                    <div><strong>Step 3:</strong> Return to start (uses {currentStepData.leftSteps} more steps)</div>
                    <div><strong>Step 4:</strong> Go right {currentStepData.rightSteps} steps and collect fruits from position {startPos + 1} to {startPos + currentStepData.rightSteps}</div>
                    <div className="mt-2 text-xs">
                      <strong>Total range covered:</strong> [{currentStepData.range[0]}, {currentStepData.range[1]}]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="bg-white rounded-lg p-4 mt-6 shadow-md">
          <h2 className="text-xl font-semibold mb-3">Results Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Right First Strategy</h3>
              <div className="space-y-1 text-sm">
                {rightFirstSteps.map((step, i) => (
                  <div key={i} className={`p-2 rounded ${step.fruits === maxFruits ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    R:{step.rightSteps}, L:{step.leftSteps} → {step.fruits} fruits
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Left First Strategy</h3>
              <div className="space-y-1 text-sm">
                {leftFirstSteps.map((step, i) => (
                  <div key={i} className={`p-2 rounded ${step.fruits === maxFruits ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                    L:{step.leftSteps}, R:{step.rightSteps} → {step.fruits} fruits
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
            <div className="text-lg font-bold text-green-800">Maximum Fruits: {maxFruits}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeAnimation;