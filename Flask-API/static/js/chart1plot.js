// Changing sport images between female and male options
function changeImages() {
  ​
    // Set variables for image id and dropdown values
    let imageChange = document.getElementById("imageChange");
    let dataset = d3.select("#selDataset").property("value");
  ​
    // if the dropdown menu option is female, use this image
    if (dataset == 'female') {
      imageChange.setAttribute('src', "../static/assets/images/images_chart1/gymnastics.png");
    }
    // if the dropdown menu option is male, use this image
    if (dataset == 'male') {
      imageChange.setAttribute('src',"../static/assets/images/images_chart1/wrestling.png");
    }
  }
  selDataset.addEventListener("change", changeImages);
  ​
  ​
  // Setting json files to a variable
  var promises = [
    d3.json("../static/assets/data/female_bodycomp_age.json"),
    d3.json("../static/assets/data/male_bodycomp_age.json")]
  ​
    // d3.json("api/event/body-composition/F"),
    // d3.json("/api/event/body-composition/M")]
  ​
  // Loading multiple datasets 
  Promise.all(promises).then(function(allData){
    var femaleData = allData[0];
    var maleData = allData[1];
    console.log(femaleData)
    console.log(maleData)
  ​
  // Male ///////////////////////////
  // Creating empty arrays and object 
    male_obj = {};
    m_event_list = [];
    m_age_list = [];
    m_height_list = [];
    m_weight_list = [];
  ​
  // Getting Age, Height, Weight and pushing to lists
    for(var i = 0; i < maleData.length; i++) {
      m_event_list.push(maleData[i].event)
      m_age_list.push(maleData[i].age)
      m_height_list.push((maleData[i].height)/ 30.48)
      m_weight_list.push((maleData[i].weight) * 2.205)}
     // console.log(m_event_list)
     // console.log(m_age_list)
     // console.log(m_height_list)
     // console.log(m_weight_list)
  ​
    // Setting xValues 
    var xValue = m_event_list;
  ​
    // Setting yValues 
    var yValue1 = m_age_list;
    var yValue2 = m_height_list;
    var yValue3 = m_weight_list;
  ​
  // Making male object
    var male_obj = {
      xValue: m_event_list,
      yValue1: m_age_list,
      yValue2: m_height_list,
      yValue3: m_weight_list,
      textValue1: ("Male Age"),
      textValue2: ("Male Height"),
      textValue3: ("Male Weight")}
    // console.log(male_obj)
  ​
  // Setting male object values to variables for barplot
    var xValue_male = (male_obj.xValue)
    var yValue1_male = (male_obj.yValue1)
    var yValue2_male = (male_obj.yValue2)
    var yValue3_male = (male_obj.yValue3)
    // var textValue1_male = (male_obj.textValue1)
    // var textValue2_male = (male_obj.textValue2)
    // var textValue3_male = (male_obj.textValue3)
  ​
  ​
    // Female ///////////////////////////
    female_obj = {};
    f_event_list = [];
    f_age_list = [];
    f_height_list = [];
    f_weight_list = [];
  ​
  // Getting age, height, Weight and pushing to lists
    for(var i = 0; i < femaleData.length; i++) {
      f_event_list.push(femaleData[i].event)
      f_age_list.push(femaleData[i].age)
      f_height_list.push((femaleData[i].height)/ 30.48)
      f_weight_list.push((femaleData[i].weight) * 2.205)}
     // console.log(m_event_list)
     // console.log(m_age_list)
     // console.log(m_height_list)
     // console.log(m_weight_list)
  ​
    // Setting xValues 
    var xValue = f_event_list;
  ​
    // Setting yValues 
    var yValue1 = f_age_list;
    var yValue2 = f_height_list;
    var yValue3 = f_weight_list;
  ​
  // Making female object
    var female_obj = {
      xValue: f_event_list,
      yValue1: f_age_list,
      yValue2: f_height_list,
      yValue3: f_weight_list,
      // textValue1 : ("Female Age"),
      // textValue2 : ("Female Height"),
      // textValue3 : ("Female Weight")
    }
  ​
  // Setting female object values to variables for barplot
    var xValue_female = (female_obj.xValue)
    var yValue1_female = (female_obj.yValue1)
    var yValue2_female = (female_obj.yValue2)
    var yValue3_female = (female_obj.yValue3)
    // var textValue1_female = (female_obj.textValue1)
    // var textValue2_female = (female_obj.textValue2)
    // var textValue3_female = (female_obj.textValue3)
  ​
  // Display default plot - Female
    function init1() {
      var barChart1 = {
        name: "Gold",
        x: xValue_female,
        y: yValue1_female,
        type: 'bar',
        text: (yValue1_female).map(String),
        hovertemplate: 'Female Age: %{y}<extra></extra>',
        opacity: 0.6,
        marker: {
          color: 'rgb(218,165,32)'}
      };
      var layout1 = {
        title: {
          text: 'Age',
          font: {
            size: 20,
          }},
        autosize: true,
        width: 900,
        height: 800,
        margin: {
          l: 50,
          r: 50,
          b: 300,
          t: 100,
          pad: 4},
        xaxis: {
          categoryorder:'total descending'},
        yaxis: {
            range: [0, 35]
            },
    };
    Plotly.newPlot("plot1", [barChart1], layout1);
  }
    function init2() {
      var barChart2 = {
        name: "Gold",
        x: xValue_female,
        y: yValue2_female,
        type: 'bar',
        text: (yValue2_female).map(String),
        hovertemplate: 'Female Height: %{y:.1f}<extra></extra>',
        opacity: 0.6,
        marker: {
          color: 'rgb(218,165,32)'}
      };
      var layout2 = {
        title: {
          text: "Height",
          font: {
            size: 20,
          }},
        autosize: true,
        width: 900,
        height: 800,
        margin: {
          l: 50,
          r: 50,
          b: 300,
          t: 100,
          pad: 4},
        xaxis: {
          categoryorder:'total descending'},
        yaxis: {
            range: [0, 7]}
      };
    Plotly.newPlot("plot2", [barChart2], layout2);
  }
    function init3() {
      var barChart3 = {
        name: "Gold",
        x: xValue_female,
        y: yValue3_female,
        type: 'bar',
        text: (yValue3_female).map(String),
        hovertemplate: 'Female Weight: %{y:.2f}<extra></extra>',
        opacity: 0.6,
        marker: {
          color: 'rgb(218,165,32)'},
      };
      var layout3 = {
        title: {
          text: "Weight",
          font: {
            size: 20,
          }},
        autosize: true,
        width: 900,
        height: 800,
        margin: {
          l: 50,
          r: 50,
          b: 300,
          t: 100,
          pad: 4},
        xaxis: {
          categoryorder:'total descending'},
        yaxis: {
            range: [0, 350]},
      };
    Plotly.newPlot("plot3", [barChart3], layout3);
  }
  init1()
  init2()
  init3()
  ​
    // Function to change values when female of male is selected and plot barcharts
   d3.selectAll("#selDataset").on("change", getData);
    function getData() {
      function barchart1 () {
        // Set variable for dropdown menu value
        var dataset = d3.select("#selDataset").property("value");
  ​
        // Set empty arrays for changes to values 
        var x = [];
        var y = [];
        var text = [];
        var hovertemplate = [];
  ​
        // if the dropdown menu option is female, use these values
        if (dataset == 'female') {
          x = xValue_female;
          y = yValue1_female;
          text = (yValue1_female).map(String);
          hovertemplate = 'Female Age: %{y}<extra></extra>';
        }
        // if the dropdown menu option is male, use these values
        if (dataset === 'male') {
          x = xValue_male;
          y = yValue1_male;
          text = (yValue1_male).map(String);
          hovertemplate = 'Male Age: %{y}<extra></extra>';
        }
        Plotly.restyle("plot1", "x", [x]);
        Plotly.restyle("plot1", "y", [y]);
        Plotly.restyle("plot1", "text", [text]);
        Plotly.restyle("plot1", "hovertemplate", [hovertemplate]);
      }
      function barchart2 () {
        // Set variable for dropdown menu value
        var dataset = d3.select("#selDataset").property("value");
  ​
        // Set empty arrays for changes to values 
        var x = [];
        var y = [];
        var text = [];
        var hovertemplate = [];
        // if the dropdown menu option is female, use these values
        if (dataset == 'female') {
          x = xValue_female;
          y = yValue2_female;
          text = (yValue2_female).map(String);
          hovertemplate = 'Female Height: %{y:.1f}<extra></extra>';
        }
        // if the dropdown menu option is male, use these values
        if (dataset === 'male') {
          x = xValue_male;
          y = yValue2_male;
          text = (yValue2_male).map(String);
          hovertemplate = 'Male Height: %{y:.1f}<extra></extra>';
        }
        Plotly.restyle("plot2", "x", [x]);
        Plotly.restyle("plot2", "y", [y]);
        Plotly.restyle("plot2", "text", [text]);
        Plotly.restyle("plot2", "hovertemplate", [hovertemplate]);
      }
      function barchart3 () {
        // Set variable for dropdown menu value
        var dataset = d3.select("#selDataset").property("value");
  ​
        // Set empty arrays for changes to values 
        var x = [];
        var y = [];
        var text = [];
        var hovertemplate = [];
  ​
        // if the dropdown menu option is female, use these values
        if (dataset == 'female') {
          x = xValue_female;
          y = yValue3_female;
          text = (yValue3_female).map(String);;
          hovertemplate = 'Female Weight: %{y:.2f}<extra></extra>'
        }
        // if the dropdown menu option is male, use these values
        if (dataset === 'male') {
          x = xValue_male;
          y = yValue3_male;
          text = (yValue3_male).map(String);
          hovertemplate = 'Male Weight: %{y:.2f}<extra></extra>';
        }
        Plotly.restyle("plot3", "x", [x]);
        Plotly.restyle("plot3", "y", [y]);
        Plotly.restyle("plot3", "text", [text]);
        Plotly.restyle("plot3", "hovertemplate", [hovertemplate]);
      }
    barchart1()
    barchart2()
    barchart3()
    }
  });