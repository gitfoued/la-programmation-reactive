function (getSearchResultSet, keyPresses, textBox) {

	var getSearchResultSets =
		keyPresses.
			map(function () {
				return textBox.value;
			}).
			throttleTime(1000).
			distinctUntilChanged().
			filter(function (s) { return s.length > 0; }).
			concatMap(function (text) {
				return getSearchResultSet(text).takeUntil(keyPresses);
			});

	return getSearchResultSets;
}
        