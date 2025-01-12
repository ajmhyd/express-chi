import Congestion from '../components/Congestion.tsx';
import Footer from '../components/Footer.tsx';
import TravelTimeDifference from '../components/TravelTimeDifference.tsx';
import Header from '../islands/Theme.tsx';
import {Direction, TrafficLevel} from '../types.ts';

const URL = `https://www.travelmidwest.com/lmiga/travelTime.json?path=GATEWAY.IL.KENNEDY`;
const PATH_BASE = `GATEWAY.IL.KENNEDY.KENNEDY REVERSIBLE`;

// The _MAIN IDs are for the full length of the express lanes,
// which can be used for travel time.
// The _ALL IDs are for the shorter sections of the express lanes,
// which cannot be used for travel time, but can be used for other data.

const PATH_INBOUND = `${PATH_BASE} EB`;
const ID_INBOUND_MAIN = `IL-TESTTSC-249`;
const IDS_INBOUND_ALL = ['IL-TSCDMS-EB_I_90 Express_ADDISON_TO_OHIO_342'];
const PATH_OUTBOUND = `${PATH_BASE} WB`;
const ID_OUTBOUND_MAIN = `IL-TESTTSC-250`;
const IDS_OUTBOUND_ALL = ['IL-TSCDMS-WB_I_90 Express_ARMITAGE_TO_MONTROSE_341'];
const TIMEOUT_MS = 1_000;

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
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const response = await fetch(URL, {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		if (!response.ok) return null;
		return response.json();
	} catch (error) {
		clearTimeout(timeout);
		console.error(error);
		return null;
	}
};

export default async function Home() {
	const data = await fetchApi();

	const inboundDataRow = data?.find(row => row.tablePath === PATH_INBOUND);
	const inboundData =
		inboundDataRow?.reportRows.find(row => row.id === ID_INBOUND_MAIN) ??
		inboundDataRow?.reportRows.find(row =>
			IDS_INBOUND_ALL.includes(row.id),
		);

	const outboundDataRow = data?.find(row => row.tablePath === PATH_OUTBOUND);
	const outboundData =
		outboundDataRow?.reportRows.find(row => row.id === ID_OUTBOUND_MAIN) ??
		outboundDataRow?.reportRows.find(row =>
			IDS_OUTBOUND_ALL.includes(row.id),
		);

	let direction: Direction = Direction.Unknown;
	let travelTime: number | null = null;
	let averageTravelTime: number | null = null;
	let speed: number | null = null;
	let level: TrafficLevel = TrafficLevel.Unknown;

	const isInbound = inboundData && inboundData?.level !== 'Unknown';
	const isOutbound = outboundData && outboundData?.level !== 'Unknown';
	// If we are missing some data or are both inbound and outbound simultaneously, the data should be considered unreliable
	const isUnreliable =
		!inboundData || !outboundData || (isInbound && isOutbound);

	if (isUnreliable) {
		direction = Direction.Unknown;
	} else if (!isInbound && !isOutbound) {
		direction = Direction.Closed;
	} else {
		const data = isInbound ? inboundData : outboundData;
		if (data) {
			direction = isInbound ? Direction.Inbound : Direction.Outbound;
			if ([ID_INBOUND_MAIN, ID_OUTBOUND_MAIN].includes(data.id)) {
				travelTime = data.tt === -1 ? null : Math.round(data.tt);
				averageTravelTime =
					data.avg === -1 ? null : Math.round(data.avg);
			}
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
					{[Direction.Unknown, Direction.Closed].includes(
						direction,
					) ? (
						<h1 className="text-4xl mt-4 text-center tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
							<span className="block xl:inline">Status: </span>
							<span className="block text-blue-300 xl:inline">
								{direction}
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
