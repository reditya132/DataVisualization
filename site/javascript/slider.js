function showValue(newValue)
{
    document.getElementById("range").innerHTML=newValue;
}

function updateVisualizations(newValue)
{
    drawScatterplot(newValue);
}