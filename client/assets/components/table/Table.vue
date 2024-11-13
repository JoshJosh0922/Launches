<style>
@import "./Table.css";
</style>
<template>
    <v-container class="t-main-container" :style="t_height">
        <v-data-table class="table-container" :headers="header_data" :items="NewData"
            :sort-by="[{ key: 'calories', order: 'asc' }, { key: 'fat', order: 'desc' }]" multi-sort
            :hide-default-footer="hide_page">
            <template v-slot:item.actions="{ item }">
                <div class="button-View" @click="handleRowClick(item)">
                    <v-icon class="text-icon" icon="mdi-list-box" />
                </div>
            </template>
        </v-data-table>
    </v-container>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
    Tb_data: {
        type: Array,
        required: true, // Ensure it's always passed as an array
    },
    header_data: Array,
    t_height: String,
    getSelected: Function,
    hide_page: Boolean,
    TypeTable: String,
});

const handleRowClick = (data) => {
    props?.getSelected(data);
    console.log("get ", data);
};

const NewData = computed(() => {
    return props?.Tb_data.map((res) => {
        return {
            launchDate: new Date(res.launch_date_unix * 1000).toLocaleString(
                "en-us",
                {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                }
            ),
            launchSite: res?.launch_site?.site_name,
            rocketName: res["rocket"]?.["rocket_name"] ?? "",
            ...res,
        };
    });
});

</script>
