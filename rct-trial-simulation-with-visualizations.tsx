import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RCTTrialResults = () => {
  const [populationSize, setPopulationSize] = useState(1000);
  const [treatmentGroupSize, setTreatmentGroupSize] = useState(500);
  const [controlGroupSize, setControlGroupSize] = useState(500);
  const [treatmentEffect, setTreatmentEffect] = useState(0.2);
  const [treatmentGroup, setTreatmentGroup] = useState([]);
  const [controlGroup, setControlGroup] = useState([]);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState([]);
  const [controlOutcomes, setControlOutcomes] = useState([]);
  const [treatmentMean, setTreatmentMean] = useState(0);
  const [controlMean, setControlMean] = useState(0);
  const [treatmentEffectEstimate, setTreatmentEffectEstimate] = useState(0);
  const [pValue, setPValue] = useState(0);

  useEffect(() => {
    // Randomly assign participants to treatment and control groups
    const tempTreatmentGroup = [];
    const tempControlGroup = [];
    for (let i = 0; i < populationSize; i++) {
      if (i < treatmentGroupSize) {
        tempTreatmentGroup.push(i);
      } else {
        tempControlGroup.push(i);
      }
    }
    shuffleArray(tempTreatmentGroup);
    shuffleArray(tempControlGroup);
    setTreatmentGroup(tempTreatmentGroup);
    setControlGroup(tempControlGroup);

    // Simulate the outcome variable for each group
    const tempTreatmentOutcomes = tempTreatmentGroup.map(() => Math.random() * (1 + treatmentEffect));
    const tempControlOutcomes = tempControlGroup.map(() => Math.random());
    setTreatmentOutcomes(tempTreatmentOutcomes);
    setControlOutcomes(tempControlOutcomes);

    // Calculate the average outcome for each group
    const treatmentMean = tempTreatmentOutcomes.reduce((sum, value) => sum + value, 0) / treatmentGroupSize;
    const controlMean = tempControlOutcomes.reduce((sum, value) => sum + value, 0) / controlGroupSize;
    setTreatmentMean(treatmentMean);
    setControlMean(controlMean);

    // Calculate the treatment effect and p-value
    const treatmentEffectEstimate = treatmentMean - controlMean;
    const standardError = Math.sqrt((variance(tempTreatmentOutcomes) / treatmentGroupSize) + (variance(tempControlOutcomes) / controlGroupSize));
    const tStatistic = treatmentEffectEstimate / standardError;
    const pValue = 2 * (1 - tCdf(Math.abs(tStatistic), treatmentGroupSize + controlGroupSize - 2));
    setTreatmentEffectEstimate(treatmentEffectEstimate);
    setPValue(pValue);
  }, [populationSize, treatmentGroupSize, controlGroupSize, treatmentEffect]);

  const data = [
    { name: 'Treatment', value: treatmentMean },
    { name: 'Control', value: controlMean },
  ];

  const outcomeDistribution = [
    { group: 'Treatment', outcome: treatmentOutcomes },
    { group: 'Control', outcome: controlOutcomes },
  ];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Comprehensive RCT Trial Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <p>Population Size: {populationSize}</p>
            <p>Treatment Group Size: {treatmentGroupSize}</p>
            <p>Control Group Size: {controlGroupSize}</p>
            <p>Treatment Effect: {treatmentEffect.toFixed(2)}</p>
          </div>
          <div className="mb-4">
            <p>Treatment Effect Estimate: {treatmentEffectEstimate.toFixed(2)}</p>
            <p>P-value: {pValue.toFixed(4)}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Outcome Means</h3>
              <LineChart width={400} height={300} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Outcome Distributions</h3>
              <BarChart width={400} height={300} data={outcomeDistribution}>
                <XAxis dataKey="group" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Bar dataKey="outcome" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RCTTrialResults;

// Helper functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function variance(array) {
  const mean = array.reduce((sum, value) => sum + value, 0) / array.length;
  return array.reduce((sum, value) => sum + (value - mean) ** 2, 0) / array.length;
}

function tCdf(t, df) {
  const p = 0.5 + 0.5 * Math.sign(t) * regularizedIncompleteBeta(df / (df + t * t), df / 2, 0.5);
  return p;
}

function regularizedIncompleteBeta(x, a, b) {
  if (x <= 0) {
    return 0;
  } else if (x >= 1) {
    return 1;
  } else {
    return Math.exp(
      lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
      a * Math.log(x) + b * Math.log(1 - x)
    );
  }
}

function lnGamma(x) {
  let j = 0;
  let t, y, tmp, ser;
  const cof = [
    57.1562356658629235, -59.5979603554754912,
    14.1360979747417471, -0.491913816097620199,
    0.339946499848118887e-4, 0.465236289270563052e-4,
    -0.983744753048795646e-4, 0.158088703224912494e-3,
    -0.210264441724104883e-3, 0.217439618115212643e-3,
    -0.164318106536763890e-3, 0.844182543528866442e-4,
    -0.261908384015814087e-4, 0.368991826595316234e-5
  ];

  if (x < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }

  x -= 1;
  y = x;
  t = y + 5.24218750000000000;
  t = (y + 0.5) * Math.log(t) - t;
  ser = 0.999999999999997092;

  for (j; j < 14; j++) {
    y += 1;
    ser += cof[j] / y;
  }

  return t + Math.log(2.5066282746310005 * ser);
}
