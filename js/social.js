/* Authenticated RPCs expose only profiles shared through accepted friendships. */
window.Social = (() => {
  const state={data:null,error:'',busy:false,userId:null};
  let pending=null;
  function message(error) {
    if(error.backendCode==='PGRST202'||error.backendCode==='42P01')return 'socialSetup';
    if(error.backendCode==='23505')return 'usernameTaken';
    if(/profile_required/.test(error.message))return 'socialNeedProfile';
    if(/friend_not_found/.test(error.message))return 'friendNotFound';
    if(/self_request/.test(error.message))return 'friendSelf';
    if(/request_limit|friend_limit/.test(error.message))return 'friendLimit';
    if(error.code==='auth')return 'socialSignIn';
    if(error.code==='network')return 'socialOffline';
    return 'socialError';
  }
  function reset() {state.data=null;state.error='';state.userId=null;}
  async function refresh() {
    const cloud=window.Cloud;
    if(!cloud||!cloud.on||!cloud.user){reset();state.error='socialSignIn';return;}
    if(state.userId!==cloud.user.id){reset();state.userId=cloud.user.id;}
    if(pending)return pending;
    const owner=state.userId;state.busy=true;state.error='';
    pending=(async()=>{
      try {await cloud.sync();const data=await cloud.rpc('social_dashboard',{});if(cloud.user&&cloud.user.id===owner)state.data=data;}
      catch(error){if(cloud.user&&cloud.user.id===owner)state.error=message(error);}
      finally{state.busy=false;pending=null;}
    })();return pending;
  }
  async function mutate(name,body) {
    if(!Cloud.on||!Cloud.user)throw Object.assign(new Error('sign in'),{code:'auth'});
    return Cloud.rpc(name,body);
  }
  let publishing=Promise.resolve();
  function publish(profile) {
    const p=Profile.clean(profile),owner=Cloud.user&&Cloud.user.id;
    const job=publishing.catch(()=>{}).then(async()=>{
      if(!owner||!Cloud.user||Cloud.user.id!==owner)throw Object.assign(new Error('sign in'),{code:'auth'});
      await Cloud.sync();
      if(!Cloud.user||Cloud.user.id!==owner)throw Object.assign(new Error('sign in'),{code:'auth'});
      return mutate('social_save_profile',{p_username:p.username,p_display_name:p.displayName,p_bio:p.bio,p_avatar:p.avatar,p_theme:p.theme,p_badges:p.showcase});
    });
    publishing=job;return job;
  }
  return {state,refresh,reset,message,publish,mutate};
})();
