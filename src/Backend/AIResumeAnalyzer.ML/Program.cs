using Microsoft.ML;
using Microsoft.ML.Data;

var mlContext = new MLContext(seed: 1);

string dataPath = Path.Combine("data", "training-data.csv");
string modelPath = Path.Combine("Models", "resume-level-model.zip");

// Check if training data exists
if (!File.Exists(dataPath))
{
    Console.WriteLine($"Training data not found at {dataPath}");
    Console.WriteLine("Creating sample training data...");
    
    // Create sample data directory
    Directory.CreateDirectory(Path.GetDirectoryName(dataPath)!);
    
    // Create sample CSV
    var sampleData = @"ResumeText,JobText,Label
Experienced C# developer with 5 years in .NET and React,Senior .NET Engineer position requiring C# and React,Senior
Junior developer with basic C# knowledge,Senior .NET Engineer position requiring C# and React,Junior
Mid-level developer with 3 years C# and SQL experience,Mid-level .NET Developer with SQL,Mid
No relevant experience,Senior .NET Engineer position requiring C# and React,Reject";
    
    File.WriteAllText(dataPath, sampleData);
    Console.WriteLine("Sample training data created.");
}

var data = mlContext.Data.LoadFromTextFile<ResumeJobLabel>(
    dataPath,
    hasHeader: true,
    separatorChar: ',');

var split = mlContext.Data.TrainTestSplit(data, testFraction: 0.2);

var pipeline = mlContext.Transforms.Text.FeaturizeText(
        outputColumnName: "ResumeFeatures",
        nameof(ResumeJobLabel.ResumeText))
    .Append(mlContext.Transforms.Text.FeaturizeText(
        outputColumnName: "JobFeatures",
        nameof(ResumeJobLabel.JobText)))
    .Append(mlContext.Transforms.Concatenate(
        "Features", "ResumeFeatures", "JobFeatures"))
    .Append(mlContext.Transforms.NormalizeMinMax("Features"))
    .Append(mlContext.Transforms.Conversion.MapValueToKey(
        outputColumnName: "Label",
        inputColumnName: nameof(ResumeJobLabel.Label)))
    .Append(mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy())
    .Append(mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));

Console.WriteLine("Training model...");
var model = pipeline.Fit(split.TrainSet);

Console.WriteLine("Evaluating model...");
var predictions = model.Transform(split.TestSet);
var metrics = mlContext.MulticlassClassification.Evaluate(predictions);

Console.WriteLine($"MacroAccuracy: {metrics.MacroAccuracy:P2}");
Console.WriteLine($"MicroAccuracy: {metrics.MicroAccuracy:P2}");

Directory.CreateDirectory(Path.GetDirectoryName(modelPath)!);
mlContext.Model.Save(model, data.Schema, modelPath);
Console.WriteLine($"Model saved to {modelPath}");

public class ResumeJobLabel
{
    [LoadColumn(0)]
    public string ResumeText { get; set; } = string.Empty;

    [LoadColumn(1)]
    public string JobText { get; set; } = string.Empty;

    [LoadColumn(2)]
    public string Label { get; set; } = string.Empty;
}




