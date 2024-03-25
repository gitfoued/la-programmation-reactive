function(window, $) {
	var getJSON = function(url) {
		return Observable.create(function(observer) {
			var subscribed = true;

			$.getJSON(url,
				{
					success:
						function(data) {
							// If client is still interested in the results, send them.
							if (subscribed) {
								// Send data to the client
								observer.next(data);
								// Immediately complete the sequence
								observer.complete();
							}
						},
					error: function(ex) {
						// If client is still interested in the results, send them.
						if (subscribed) {
							// Inform the client that an error occurred.
							observer.error(ex);
						}
					}
				});

			// Definition of the Subscription objects unsubscribe (dispose in RxJS 4) method.
			return function() {
				subscribed = false;
			}
		});
	};

	var observer = {
		// onNext in RxJS 4
		next: function (data) {
			alert(JSON.stringify(data));
		},
		// onError in RxJS 4
		error: function (err) {
			alert(err);
		},
		// onComplete in RxJS 4
		complete: function () {
			alert("The asynchronous operation has completed.");
		}
	};

	var subscription =
		getJSON("http://api-global.netflix.com/abTestInformation").subscribe(observer);

	// setTimeout(function () {
	// 	alert("Changed my mind, I do not want notifications any more!")
	// 	subscription.unsubscribe();
	// }, 10);
}
		//function(window, getJSON, showMovieLists, showError) {
	var movieListsSequence =
    Observable.zip(
        getJSON("http://api-global.netflix.com/abTestInformation").
            concatMap(function(abTestInformation) {
                return Observable.zip(
                    getJSON("http://api-global.netflix.com/" + abTestInformation.urlPrefix + "/config").
                        concatMap(function(config) {
                            if (config.showInstantQueue) {
                                return getJSON("http://api-global.netflix.com/" + abTestInformation.urlPrefix + "/queue").
                                    map(function(queueMessage) {
                                        return queueMessage.list;
                                    });
                            }
                            else {
                                return Observable.returnValue(undefined);
                            }
                        }),
                    getJSON("http://api-global.netflix.com/" + abTestInformation.urlPrefix + "/movieLists"),
                    function(queue, movieListsMessage) {
                        var copyOfMovieLists = [].concat(movieListsMessage.list);
                        if (queue !== undefined) {
                            copyOfMovieLists.push(queue);
                        }

                        return copyOfMovieLists;
                    });
            }),
        Observable.fromEvent(window, "load"),
        function(movieLists, loadEvent) {
            return movieLists;
        });

movieListsSequence.
    do(
        function(movieLists) {
            showMovieLists(movieLists);
        },
        function(err) {
            showError(err);
        }
    ).
    subscribe();
}
    