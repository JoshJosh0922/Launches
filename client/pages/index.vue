<style>
@import '../assets/styles/index.css';
</style>
<template>
	<ClientOnly>
		<v-container class="body-container">
			<section class="section-Container">
				<RocketForms :formOpen="openForms" :formData="selectedData" :setCloseForm="closeForm" />
				<div class="filter_container">
					<div class="filters-item">
						<div class="sort-filter-data">
							<label class="label-titles">Sort By, Filter & Search</label>
							<div class="combobox-sort-container">
								<div class="combo-box-container">
									<select name="launch" id="rockets" class="comboBox" v-model="Selected_By">
										<option value="">Select SortBy</option>
										<option v-for="items in headers.slice(0, headers.length - 1)" :key="items.title"
											:value="items.specialKey">
											{{ items.title }}
										</option>
									</select>
									<div>
										<label> - </label>
									</div>
									<select name="sorting" id="sorts" class="comboBox" v-model="Sort_By">
										<option value="">Select Asc/Desc</option>
										<option value="Asc">Asc</option>
										<option value="Desc">Desc</option>
									</select>
								</div>
								<div class="button-filter" @click="filterData()">
									<label class="label-text">Sort</label>
								</div>
							</div>
						</div>
						<div class="datefilter-container">
							<div class="date-picker-container">
								<input class="date-pickers" type="month" id="start" name="trip-start" min="1899-01-01"
									max="2023-12-31" v-model="startDate">
								<div>
									<label> - </label>
								</div>
								<input class="date-pickers" type="month" id="start" name="trip-start" min="1899-01-01"
									max="2023-12-31" v-model="endDate">
							</div>
							<div class="button-filter" @click="filterData()">
								<label class="label-text">Filter</label>
							</div>
						</div>
						<div class="search-container">
							<input type="text" class="text-box" placeholder="Search by Mission Name" v-model="SearchVal"
								@input="getValueSearch">
							<div class="button-search" @click="filterData()">
								<v-icon icon="mdi-magnify" class="icon-search" />
							</div>
						</div>
						<div v-if="hideClear" class="button-clear" @click="clearSearch()">
							<v-icon icon="mdi-close" class="icon-clear" />
						</div>
					</div>
				</div>
				<Table :Tb_data="storeData.data.value ?? storeData.data" :t_height="t_height" :header_data="headers"
					:getSelected="getSelectData" :hide_page="false" :TypeTable="'card'" />
			</section>
		</v-container>
	</ClientOnly>
</template>
<script setup>
import Table from '~/assets/components/table/Table.vue';
import { inject } from 'vue';
import { useDisplayData, useFavoriteData } from '~/scripts/Backend';
import RocketForms from '~/assets/components/Form/RocketForms.vue';

const headers = [
	{
		title: 'Mission Name',
		align: 'start',
		key: 'mission_name',
		specialKey: 'mission_name',
		sortable: false,
	},
	{
		title: 'Rocket Name',
		key: 'rocketName',
		specialKey: 'rocketName',
		sortable: false,
	},
	{
		title: 'Launch Date',
		key: 'launchDate',
		specialKey: 'launch_date_unix',
		sortable: false,
	},
	{
		title: 'Launch Site',
		key: 'launchSite',
		specialKey: 'launchSite',
		sortable: false,
	},
	{
		title: 'Actions',
		key: 'actions',
		sortable: false,
	}
];

const t_height = "height: calc(100% - 100px);";

const isHighlighted = inject('Tabs');
const tabValue = ref(2);
const SearchVal = ref("");
let hideClear = false;
let DisplayData = [];
const startDate = ref("");
const endDate = ref("");
const Selected_By = ref("");
const Sort_By = ref("");
const openForms = ref(false);
const selectedData = ref([]);

const storeData = useDisplayData();
const favData = useFavoriteData();

watch(isHighlighted, (newValue, oldValue) => {
	tabValue.value = newValue;
});

const launchesQuery = gql`
			query getlaunches {
				launches {
					id
					launch_date_unix
					mission_name
					details
					rocket {
						rocket_name
						rocket {
							stages
							height {
								feet
								meters
							}
							diameter {
								feet
								meters
							}
							mass {
								kg
								lb
							}
						first_flight
							description
						}
					}
					launch_site {
						site_name
						site_name_long
					}
				}
			}
		`;

const { data: launchesData } = useAsyncQuery(launchesQuery);
const launches = computed(() => launchesData.value?.launches ?? []);

DisplayData = launches;
storeData.setData(launches);

// Watch
watch(isHighlighted, (newValue, oldValue) => {
	if (newValue === 2) {
		storeData.setData(launches.value);
	} else {
		storeData.setData(favData.data);
	}
});

watch(() => favData.data, (newData) => {
	if (isHighlighted.value === 2) {
		return;
	}
	storeData.data = newData;
});


// Functions

const getSelectData = (data) => {
	selectedData.value = data;
	openForms.value = true;

}

const closeForm = (val) => {
	openForms.value = val;
	if (tabValue.value != 2) {
		storeData.setData(favData.data);
	}
}

const getValueSearch = (val) => {
	SearchVal.value = val?.target?.value;

	checkValInput(val);
}

const checkValInput = (val) => {
	if (!val) {
		hideClear = false;
		DisplayData = launches?.value;
	} else {
		hideClear = true;
	}
}

const clearSearch = () => {
	SearchVal.value = '';
	hideClear = false;
	DisplayData = launches.value;
	startDate.value = "";
	endDate.value = "";
	Selected_By.value = "";
	Sort_By.value = "";
	if (tabValue.value === 2) {
		storeData.setData(launches.value);
	} else {
		storeData.setData(favData.data);
	}
}

const searchItem = (OrigData, value) => {
	const data = OrigData?.filter(
		res =>
			res?.mission_name?.toLowerCase()?.includes(value) && res
	);

	// storeData.setData(data);
	return data;
};

const searchRangeDate = (origData, start, end) => {
	let startDateUnix = new Date(start); // Convert startDate to Unix time in seconds
	let endDateUnix = new Date(end);     // Convert endDate to Unix time in seconds
	startDateUnix.setHours(0, 0, 0, 0);
	endDateUnix.setHours(23, 59, 59, 999);
	startDateUnix.setDate(1);
	endDateUnix.setHours(32);

	let startVal = Math.floor(startDateUnix.getTime() / 1000);
	let endVal = Math.floor(endDateUnix.getTime() / 1000);

	const data = origData.filter(
		res =>
			res?.launch_date_unix >= startVal && res?.launch_date_unix <= endVal
	);

	// storeData.setData(data);
	hideClear = true;

	return data;
};

const sortData = (origData, sort_field, sort_order) => {
	let field = sort_field;
	let order = sort_order;
	let data = origData;

	if (!data || field === "None") {
		return data;
	}

	let sortedData = [...data];

	const compareFunction = (a, b) => {
		const aValue = a[field];
		const bValue = b[field];

		if (aValue === undefined) return 1;
		if (bValue === undefined) return -1;

		if (!isNaN(aValue) && !isNaN(bValue)) {
			return order === "Asc" ? aValue - bValue : bValue - aValue;
		} else {
			return order === "Asc"
				? String(aValue).localeCompare(String(bValue))
				: String(bValue).localeCompare(String(aValue));
		}
	};

	sortedData.sort(compareFunction);
	// storeData.setData(sortedData);
	hideClear = true;

	return sortedData;
};

const filterData = () => {
	let value = SearchVal?.value.toLowerCase();
	let startD = startDate.value;
	let endD = endDate.value;
	let Field = Selected_By.value;
	let Order = Sort_By.value;
	let Filtered = storeData?.data.value ?? storeData?.data;

	if (value) {
		Filtered = searchItem(Filtered, value);
	}

	if (startD && endD) {
		Filtered = searchRangeDate(Filtered, startD, endD);
	}

	if (Field && Order) {
		Filtered = sortData(Filtered, Field, Order);
	}
	storeData.setData(Filtered);
}



</script>