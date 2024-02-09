import Congestion from '../components/Congestion.tsx';
import Footer from '../components/Footer.tsx';
import TravelTimeDifference from '../components/TravelTimeDifference.tsx';
import Header from '../islands/Theme.tsx';
import {Direction, TrafficLevel} from '../types.ts';

const URL = `https://www.travelmidwest.com/lmiga/travelTime.json?path=GATEWAY.IL.KENNEDY`;
const PATH_BASE = `GATEWAY.IL.KENNEDY.KENNEDY REVERSIBLE`;
const PATH_INBOUND = `${PATH_BASE} EB`;
const ID_INBOUND = `IL-TESTTSC-249`;
const PATH_OUTBOUND = `${PATH_BASE} WB`;
const ID_OUTBOUND = `IL-TESTTSC-250`;

interface ReportRow {
	avg: number;
	from: string;
	id: string;
	len: number;
	level: TrafficLevel;
	on: string;
	ovrAvg: boolean;
	spd: `${number}` | 'N/A';
	to: string;
	tt: number;
}

type APIResponse = Array<{
	tablePath: string;
	reportRows: ReportRow[];
	tableName: string;
}>;

const fetchApi = async (): Promise<APIResponse | null> => {
	try {
		const response = await fetch(URL);
		return response.json();
	} catch (error) {
		console.error(error);
		return null;
	}
};

export default async function Home() {
	const data = await fetchApi();

	const inboundData = data
		?.find(row => row.tablePath === PATH_INBOUND)
		?.reportRows.find(row => row.id === ID_INBOUND);
	const outboundData = data
		?.find(row => row.tablePath === PATH_OUTBOUND)
		?.reportRows.find(row => row.id === ID_OUTBOUND);

	let direction: Direction = Direction.UNKNOWN;
	let travelTime: number | null = null;
	let averageTravelTime: number | null = null;
	let speed: number | null = null;
	let level: TrafficLevel = TrafficLevel.UNKNOWN;

	const isInbound = inboundData?.level !== 'Unknown';
	const isOutbound = outboundData?.level !== 'Unknown';

	if (isInbound && isOutbound) {
		// Unreliable data, cannot be both inbound and outbound simultaneously
	} else if (!isInbound && !isOutbound) {
		direction = Direction.UNKNOWN;
	} else {
		const data = isInbound ? inboundData : outboundData;
		if (data) {
			console.log(data);
			direction = isInbound ? Direction.INBOUND : Direction.OUTBOUND;
			travelTime = data.tt === -1 ? null : Math.round(data.tt);
			averageTravelTime = data.avg === -1 ? null : Math.round(data.avg);
			speed =
				data.spd === 'N/A' ? null : Math.round(parseFloat(data.spd));
			level = data.level;
		}
	}

	return (
		<>
			<div class="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
				<Header />
				<main class="mt-10 mx-auto mb-auto max-w-7xl px-4">
					<div className="text-center">
						<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
							<span className="block xl:inline">
								{' '}
								Chicago Express Lane Status
							</span>
						</h1>
						<p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
							Up to date information on the Chicago Kennedy
							Express lanes
						</p>
					</div>
					{direction === 'Unknown' ? (
						<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
							<span className="block xl:inline">Status:</span>
							<span className="block text-blue-300 xl:inline">
								Unknown
							</span>
						</h1>
					) : (
						<dl className="mt-5 grid grid-cols-1 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
							<div>
								<div className="px-4 py-5 sm:p-6">
									<dt className="text-base font-normal  text-gray-900 dark:text-white">
										Direction
									</dt>
									<dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
										<div className="flex items-baseline text-2xl font-semibold text-blue-300">
											{direction}
										</div>
									</dd>
								</div>
							</div>

							<div>
								<div className="px-4 py-5 sm:p-6">
									<dt className="text-base font-normal text-gray-900 dark:text-white">
										Travel Time
									</dt>
									<dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
										<div className="flex items-baseline text-2xl mr-2 font-semibold text-blue-300">
											{travelTime?.toLocaleString() ??
												'N/A'}{' '}
											minutes
											<span className="ml-2 text-sm font-medium text-gray-500">
												{averageTravelTime?.toLocaleString() ??
													'N/A'}{' '}
												min avg
											</span>
										</div>

										<TravelTimeDifference
											travelTime={travelTime}
											averageTravelTime={
												averageTravelTime
											}
										/>
									</dd>
								</div>
							</div>

							<div>
								<div className="px-4 py-5 sm:p-6">
									<dt className="text-base font-normal text-gray-900 dark:text-white">
										Speed
									</dt>
									<dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
										<div className="flex items-baseline text-2xl font-semibold text-blue-300">
											{speed?.toLocaleString() ?? 'N/A'}{' '}
											mph
										</div>
										<Congestion level={level} />
									</dd>
								</div>
							</div>
						</dl>
					)}
				</main>
				<Footer />
			</div>
		</>
	);
}
