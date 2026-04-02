# <span style="font-family: 'Times New Roman', serif;">Design Choices</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 1: Genres Over Date Added</span>

<span style="font-family: 'Times New Roman', serif;">
Although the data of dates added spans 2008 - 2021, we chose to shorten the x-axis to the 2014-2021 range because nearly all of the lines were either flat or non-present before the 2014 milestone. This makes the graph more readable because the unique portion of the data (the spike in 2018) is now more centralized and larger. Each genre has a different color along a range of values in an attempt to differentiate them from each other with a legend on the side.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 2: Countries by Content Type</span>

<span style="font-family: 'Times New Roman', serif;">
We chose to reorder the countries in the dataset by most to least total content produced in order to better illustrate the comparison between the countries more intuitively than a random order. A tooltip over the bar showcases the precise numbers, aiding with countries like Nigeria where the number of television titles produced is so small it can be hard to see clearly. The horizontal bar chart was a design choice that we felt made the graph easier to understand.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 3: Maturity Rate by Genre</span>

<span style="font-family: 'Times New Roman', serif;">
This graph is a heatmap with coloring by shade of blue to indicate the percentage (or raw value, based on the radio select button) of the cell. The x-axis is a relatively ordinal scale with least to most mature from left to right. The genres are unordered because they are purely categorical without natural ordering. We chose to display both percentage and raw counts as a radio select because the percentages show relative quantity and the raw values show the overall volume.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 4: Runtime Over Release Year</span>

<span style="font-family: 'Times New Roman', serif;">
This graph displays both mean and median to establish how reliable they both are. The relative similarity indicates that some outliers aren't significantly skewing the mean. We differentiated the lines by both color and line type (solid v. dashed) to definitively indicate the two lines. We chose to make this graph across release date instead of date added because the runtime of the content is relative to the attitudes around its creation, not its addition to a particular streaming platform. The duration is displayed in minutes because some "movies" from the origin of video media are very short. Additionally, we chose not to include a tooltip on this visualization because the values are averages/medians, so the data is most meaningful when taken comparative to surrounding values.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 5: Genre by Country</span>

<span style="font-family: 'Times New Roman', serif;">
Because this graph is about genres, we ensured that the genre colors were the same as the first graph, that way the work in sum is more understandable in sum. We chose to once again order the horizontal bar chart most to least both to mimic the prior one and to make it more understandable as the relation between each data point is clearly understandable. The select-dropdown makes it possible to see each represented nation individually and get an understanding of that market's unique tastes as compared to being perhaps dominated by a foreign nation's more populous and thus overwhelming preferences
</span>
