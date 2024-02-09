type TravelTimeDifferenceProps = {
	travelTime: number | null;
	averageTravelTime: number | null;
};

const TravelTimeDifference = ({
	travelTime,
	averageTravelTime,
}: TravelTimeDifferenceProps) => {
	const difference: number | null =
		travelTime === null || averageTravelTime === null
			? null
			: travelTime - averageTravelTime;

	if (difference === null) {
		return <div>Unknown</div>;
	} else if (difference > 0) {
		return (
			<div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 md:mt-2 lg:mt-0">
				<svg
					className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-red-500"
					fill="currentColor"
					viewBox="0 0 20 20"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
						clipRule="evenodd"
					/>
				</svg>
				<span className="sr-only">Increased by</span>
				{difference} min
			</div>
		);
	} else if (difference < 0) {
		return (
			<div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
				<svg
					className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500"
					fill="currentColor"
					viewBox="0 0 20 20"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
						clipRule="evenodd"
					/>
				</svg>
				<span className="sr-only">Decreased by</span>
				{Math.abs(difference)} min
			</div>
		);
	} else if (difference === 0) {
		return (
			<div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
				0 min
			</div>
		);
	} else {
		return <div>error</div>;
	}
};

export default TravelTimeDifference;
