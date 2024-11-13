<style>
@import '../assets/styles/default.css';
</style>
<template>
	<ClientOnly>
		<v-app class="primary-container">
			<v-main class="primary-container">
				<section class="secondary-container">
					<div class="header-container">
						<RocketForms :formOpen="openForms" :formData="selectedData" :setCloseForm="closeForm" />
						<div class="header-subcontainer"></div>
						<div class="header-subcontainer">
							<div :class="{ 'selected-tab': isHighlighted === 1 }" class="button-tab left-button"
								@click="switchHighlight(1)">
								<label class="button-tab-label">
									Favorite
								</label>
							</div>
							<div :class="{ 'selected-tab': isHighlighted === 2 }" class="button-tab right-button"
								@click="switchHighlight(2)">
								<label class="button-tab-label">
									Rocket
								</label>
							</div>
						</div>
					</div>
					<div class="main-body">
						<div class="left-side">
							<div class="left-top-mini-container">
								<label class="l-t-mc-t-label">Recent Rocket Launches</label>
								<Table :Tb_data="sortedUpcomingLaunches" :t_height="t_height1" :header_data="headers"
									:getSelected="getSelectData" :hide_page="true" :TypeTable="'row'" />
							</div>
							<div class="left-bottom-mini-container">
								<label class="l-t-mc-t-label">Past Launches</label>
								<Table :Tb_data="sortedPastLaunches" :t_height="t_height2" :header_data="headers"
									:getSelected="getSelectData" :hide_page="true" :TypeTable="'row'" />
							</div>
						</div>
						<div class="content-container">
							<slot />
						</div>
					</div>
				</section>
			</v-main>
		</v-app>
	</ClientOnly>
</template>

<script>
import Table from '~/assets/components/table/Table.vue';
import { provide } from 'vue';
import { useDisplayData, useFavoriteData } from '~/scripts/Backend';
import RocketForms from '~/assets/components/Form/RocketForms.vue';

export default {
	name: 'DefaultLayout',
	components: {
		Table,
		RocketForms,
	},
	setup() {
		const headers = [
			{
				title: 'Mission Name',
				align: 'start',
				key: 'mission_name', sortable: false,
			},
			{
				title: 'Launch Date',
				key: 'launchDate',
				sortable: false,
			},
			{
				title: 'Actions',
				key: 'actions',
				sortable: false,
			}
		]
		const t_height1 = "height: calc(100% - 34px);";
		const t_height2 = "height: calc(100% - 29px);";

		const openForms = ref(false);
		const selectedData = ref([]);

		const selection = ref(0);
		const isHighlighted = ref(2);
		const pastQuery = gql`
		 	query LaunchesPast {
				launchesPast(limit: 20) {
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
				}
			}
		`;

		const upcomingQuery = gql`
			query LaunchesUpcoming {
				launchesUpcoming {
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
				}
			}
			`;

		const { data: upcomingData } = useAsyncQuery(upcomingQuery);
		const { data: pastData } = useAsyncQuery(pastQuery);

		const upcomingLaunches = computed(() => upcomingData.value?.launchesUpcoming ?? []);
		const pastRocket = computed(() => pastData.value?.launchesPast ?? []);

		const sortedUpcomingLaunches = upcomingLaunches.value.sort((a, b) => a.launch_date_unix > b.launch_date_unix ? -1 : 1);
		const sortedPastLaunches = pastRocket.value.sort((a, b) => a.launch_date_unix > b.launch_date_unix ? -1 : 1);



		const switchHighlight = (buttonId) => {
			isHighlighted.value = buttonId;
		};

		provide("Tabs", isHighlighted);

		const getSelectData = (data) => {
			selectedData.value = data;
			openForms.value = true;

		}

		const closeForm = (val) => {
			openForms.value = val;
		}


		return {
			selection,
			sortedUpcomingLaunches,
			sortedPastLaunches,
			headers,
			t_height1,
			t_height2,
			switchHighlight,
			isHighlighted,
			openForms,
			selectedData,
			getSelectData,
			closeForm,
		};
	},
};
</script>
