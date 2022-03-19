function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    
    // 3. Create a variable that holds the samples array.
    var metaData = data.metadata;
    var samplesArray = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var filteredSampleArray = samplesArray.filter(sampleId => sampleId.id == sample);
    
    //  5. Create a variable that holds the first sample in the array.
    var filteredSample = filteredSampleArray[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = filteredSample.otu_ids;
    var otuLabels = filteredSample.otu_labels;
    var sampleValues = filteredSample.sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = otuIds.slice(0,10).map(id=>"OTU" + id).reverse();
    console.log(yticks);
    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: sampleValues.slice(0,10).reverse(),
      y: yticks,
      orientation:"h",
      text: otuLabels.slice(0,10).reverse(),
      marker: {color: "green"},
      type:'bar'
      
    }];
    //9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      color:"green"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar",barData,barLayout,{responsive: true});

    //*****create bubble chart******
    //bubble data
    var bubbleData = [{
    x: otuIds,
    y: sampleValues,
    text: otuLabels,
    mode:"markers",
    marker:{
      size: sampleValues,
      color: otuIds,
      colorscale:'Earth'
      
    }
    }];

    //bubble layout
    var bubbleLayout = {
    title:"Bacteria Cultures Per Sample",
    xaxis: {title: "OTU IDs",automargin: true},
    yaxis: {automargin: true},
    hovermode:"closest"

    };
    //create bubble chart plot
    Plotly.newPlot("bubble", bubbleData,bubbleLayout,{responsive:true});
    
    //*****create gauge chart*****
    //extract gauge data
    var filteredData = metaData.filter(sampleId => sampleId.id == sample);
    var wfreq = filteredData[0].wfreq;

    console.log(wfreq);


    //gauge data
    var gaugeData = [{
      domain: {x:[0,1],y:[0,1]},
      value:wfreq,
      title:{text:"<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      type:"indicator",
      mode:"gauge+number",
      gauge: {
        axis: { range: [0, 10], 
                tickcolor: "black"},
        bar: {color:"orange"},
        steps: [
              { range: [0, 2], color: "rgb(223, 236, 225)"},
              { range: [2, 4], color: "rgb(191, 243, 198)"},
              { range: [4, 6], color: "green" },
              { range: [6, 8], color: "darkgreen"},
              { range: [8, 10], color: "rgb(20, 60, 20)"}
                  
            ],
        threshold: {
          line: { color: "orange"},
          thickness: 0.75,
          value: wfreq
        }
      }

    }];
    // gaugeLayout
    var gaugeLayout = {
      width: 600, 
      height: 500,
      margin: { t: 0, b: 0 } 
    };

    Plotly.newPlot("gauge",gaugeData,gaugeLayout,{responsive: true});

  });
}

