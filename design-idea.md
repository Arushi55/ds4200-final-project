# <span style="font-family: 'Times New Roman', serif;">Design Choices</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 1: Genres Over Date Added</span>

<span style="font-family: 'Times New Roman', serif;">
Although the data of dates added spans 2008 - 2021, we chose to shorten the x-axis to the 2014-2021 range because nearly all of the lines were either flat or non-present before the 2014 milestone. This makes the graph more readable because the notable 2016-2018 growth period is now more centralized and prominent. Each genre is assigned a distinct color, and those same colors are reused in Visualization 2's genre breakdown panel so that a genre reads the same way across both charts. A legend is included on the side to identify each line.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 2: Countries by Content Type &amp; Genre Breakdown</span>

<span style="font-family: 'Times New Roman', serif;">
This visualization is a linked dual-panel chart. The left panel retains the horizontal stacked bar chart ordered most to least total content, with Movies and TV Shows as the two stacked segments. Clicking any country bar or its label highlights that country and drives the right panel, which renders a genre breakdown bar chart for the selected country. The United States is selected by default on load, as the largest producer it is the most informative starting state. This brush-and-link design replaces the standalone dropdown-based genre chart, allowing direct comparison between a country's output volume and its genre composition in a single view. A tooltip on the left panel still surfaces exact movie and TV show counts on hover, and percentage labels appear on each genre bar in the right panel.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 3: Genre Breakdown by Content Type (Treemap)</span>

<span style="font-family: 'Times New Roman', serif;">
This visualization is a two-level D3 treemap. At the top level, two tiles represent Movies and TV Shows, sized proportionally to their total title counts. Clicking a tile drills into the genre breakdown for that content type, where each sub-tile's area encodes the number of titles in that genre. A "← Back" button returns to the top level. We chose a treemap because the part-to-whole relationship between genres and total catalog size is immediately legible from tile area alone. Movies use a blue palette and TV Shows a red-orange palette to keep the two content types visually distinct across both levels. Tooltips on hover surface exact counts and percentages since tile labels are too small to carry that detail at smaller sizes.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 4: Maturity Rating by Country</span>

<span style="font-family: 'Times New Roman', serif;">
This graph is a heatmap of country versus maturity rating. The color scale progresses from light blue (low concentration) to dark green (high concentration), making each country's dominant rating immediately legible as the darkest cell in its row without requiring the reader to parse numbers. Zero-value cells — country–rating pairs with no titles — are filled with a diagonal hatch mark (╱╱) rather than the lightest shade of blue, so "no content" is visually distinct from "very little content." The x-axis is sorted from least to most mature (G through TV-MA, with NR at the end) to give the axis a meaningful quasi-ordinal direction. The y-axis orders countries by total output, consistent with Visualization 2, so readers can carry that mental ranking across both charts. In-cell labels display the exact value, rendered in white on darker cells and dark grey on lighter ones for contrast. We chose to display both percentage and raw count via a radio toggle because percentages reveal each country's internal distribution while raw counts show the absolute volume difference between large producers like the US and smaller ones like Nigeria.
</span>

## <span style="font-family: 'Times New Roman', serif;">Visualization 5: Runtime Over Release Year</span>

<span style="font-family: 'Times New Roman', serif;">
This graph displays both mean and median to establish how reliable they both are. The relative similarity indicates that some outliers aren't significantly skewing the mean. We differentiated the lines by both color and line type (solid v. dashed) to definitively indicate the two lines. We chose to make this graph across release date instead of date added because the runtime of the content is relative to the attitudes around its creation, not its addition to a particular streaming platform. The duration is displayed in minutes because some "movies" from the origin of video media are very short. Data points before the 1960s represent very few titles, so those early values are noisier and less reliable than the post-1980s trend — readers should treat the far left of the chart as sparse signal rather than a stable pattern. Additionally, we chose not to include a tooltip on this visualization because the values are averages/medians, so the data is most meaningful when taken comparative to surrounding values.
</span>
