@extends('common.layout')
@section('addTitle')
<title>Hello VueJS!!</title>
@stop
@section('addMeta')
<meta name="csrf-token" content="{{csrf_token()}}">
@stop
@section('addCSS')
@stop
@include('common.header')
@section('content')

<div class="container">
    <div class="title">Hello VueJS!!</div>

    <hr />
    <div>
        <span>Developers can show data from server.</span>
        <div class="title">from Server: {{ $message }}</div>
    </div>

    <!-- bind VueJS application via id -->
    <div id="hello_vuejs">
        <hr />
        <div>
            <span>Developers can bind data in VueJS App</span>
            <div class="title">from Vue App: @{{ showMessage }}</div>
        </div>

        <hr />

        <div>
            <span>Developers can use VueJS components with binded data in VueJS App.</span>
            <helloworld_props-component :message="showMessage"></helloworld_props-component>
        </div>

        <hr />

        <div>
            <span>Developers can set event-driven function by using @event=function. When clicked, binded data will be changed.</span>
            <div><button type="submit" class="btn btn-primary" id="change" @click="changeMessage()">Change Message</button></div>
        </div>

        <hr />

        <div>
            <span>Developers cannot directly bind data from server. Set data on global variables, copy it to variables in VueJS App</span>
            <helloworld_props-component :message="serverMessage"></helloworld_props-component>
        </div>

        <hr />

        <div :style="{ display: isDisplay }">
            <span>Developer can prepare user input forms via VusJS</span>
            <select class="form-control" v-model="selected" name="select_sample" md-dense>
                <option v-for="option in serverSelectData" :key="option.index" :value="option.value">@{{ option.text }}</option>
            </select>
            <div class="title" id="selected">selected: @{{ selected }}</div>
        </div>
    </div>
</div>

<script type="text/javascript">
    // keep server data as javascript method.
    function getServerData() {
        serverData = {};
        serverData.message = "<?php echo $message; ?>";
        serverData.select_data = <?php echo json_encode($select_data); ?>;
        return serverData;
    };
</script>

<script src="{{ mix('js/hello_vuejs.js') }}">
</script>

@stop
@include('common.footer')